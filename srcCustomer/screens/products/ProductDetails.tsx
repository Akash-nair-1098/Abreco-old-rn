import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  memo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Share,
  StatusBar,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../../ThemeContext';
import ProductActionBar from './components/ProductActionBar';
import {useToast} from '../../components/ToastContext';
import Icon from '../../../Icon';
import {SVG_ICONS} from '../../assets/icons/svg';
import {useWishlistStore} from '../../store/useWishlistStore';
import {getProductDetails} from '../../api/products/productsApi';
import {useCartStore} from '../../store/useCartStore';
import LoadingScreen from '../../components/LoadingScreen';
import * as NavigationService from '../../navigation/NavigationService';
import i18n from '../../utilities/i18n';

const CONTENT_HORIZONTAL_PADDING = 50;
const UNIT_COL_GAP = 10;
const UNIT_CARD_MIN_HEIGHT = 152;

function isStockAvailable(status: unknown): boolean {
  if (status == null) return false;
  const s = String(status).trim().toLowerCase();
  return s === 'in_stock' || s === 'in stock' || s === 'instock';
}

type UnitOptionRow = {
  in_shop_id: string;
  variant_id?: string;
  sku?: string;
  unit_name: string;
  packing?: string;
  conversion_rate?: number;
  price: number;
  stock_status: string;
  is_base_unit?: boolean;
};

/**
 * Id used to mark which unit card is selected: matches when the loaded row is the
 * in-shop product, including the case where API sets product_id === in_shop_id.
 */
function resolveActiveInShopId(detail: any, routeId: string | undefined): string {
  if (!detail) return '';
  const master = detail.product_id != null ? String(detail.product_id) : '';
  const inShop = detail.in_shop_id != null ? String(detail.in_shop_id) : '';
  const rowId = detail.id != null ? String(detail.id) : '';
  if (master && inShop && master === inShop) {
    return inShop;
  }
  if (inShop) return inShop;
  if (rowId) return rowId;
  return String(routeId ?? '');
}

const UnitOptionCard = memo(
  ({
    option,
    selected,
    available,
    onPress,
    styles,
    cardWidth,
    cardMinHeight,
  }: {
    option: UnitOptionRow;
    selected: boolean;
    available: boolean;
    onPress: () => void;
    styles: any;
    cardWidth: number;
    cardMinHeight: number;
  }) => {
    const {t} = useTranslation();
    const Wrapper: any = available ? TouchableOpacity : View;
    const wrapperProps = available ? {onPress, activeOpacity: 0.75} : {};

    const borderStyles = (() => {
      if (selected) {
        return available
          ? styles.unitOptionCardSelected
          : styles.unitOptionCardSelectedOos;
      }
      return available
        ? styles.unitOptionCardNeutral
        : styles.unitOptionCardUnavailable;
    })();

    return (
      <Wrapper
        style={[
          styles.unitOptionCard,
          borderStyles,
          {width: cardWidth, minHeight: cardMinHeight},
        ]}
        {...wrapperProps}>
        <View style={styles.unitOptionBody}>
        <View style={styles.unitOptionHeader}>
          <Text
            style={[
              styles.unitOptionName,
              !available && styles.unitOptionTextMuted,
            ]}
            numberOfLines={1}>
            {option.unit_name}
          </Text>
          {option.is_base_unit ? (
            <View style={styles.baseBadge}>
              <Text style={styles.baseBadgeText}>Base</Text>
            </View>
          ) : null}
        </View>
        {option.packing ? (
          <Text
            style={[
              styles.unitPacking,
              !available && styles.unitOptionTextMuted,
            ]}
            numberOfLines={2}>
            {option.packing}
          </Text>
        ) : null}
        {option.sku ? (
          <Text
            style={[
              styles.unitSku,
              !available && styles.unitOptionTextMuted,
            ]}
            numberOfLines={1}>
            {t('sku')}: {option.sku}
          </Text>
        ) : null}
        <Text
          style={[
            styles.unitPrice,
            !available && styles.unitPriceMuted,
          ]}>{`AED ${Number(option.price).toFixed(2)}`}</Text>
        <Text
          style={[
            styles.unitStockLabel,
            available ? styles.unitStockIn : styles.unitStockOut,
          ]}>
          {available ? t('in_stock') : t('out_of_stock')}
        </Text>
        </View>
      </Wrapper>
    );
  },
);

const ProductDetailsScreen = ({navigation, route}: any) => {
  const {t} = useTranslation();
  const {colors, isDark} = useTheme();
  const {width: windowWidth} = useWindowDimensions();
  const styles = useMemo(
    () => makeStyles(colors, isDark, windowWidth),
    [colors, isDark, windowWidth],
  );
  const {showToast} = useToast();

  const unitCardWidth = useMemo(
    () =>
      (windowWidth - CONTENT_HORIZONTAL_PADDING - UNIT_COL_GAP) / 2,
    [windowWidth],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [productDetails, setProductDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVariantLoading, setIsVariantLoading] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [timeLeft, setTimeLeft] = useState('');

  const {toggleWishlist, isInWishlist} = useWishlistStore();
  const addItem = useCartStore(state => state.addItem);
  const {loading} = useCartStore();

  const params = route?.params;
  const productId = params?.id;

  const hasLoadedDetailsRef = useRef(false);

  const fetchProducts = useCallback(async () => {
    if (!productId) return;
    if (hasLoadedDetailsRef.current) {
      setIsVariantLoading(true);
    } else {
      setIsLoading(true);
    }
    try {
      const results = await getProductDetails({id: productId});
      setProductDetails(results);
      // console.log('product details is', results);

      hasLoadedDetailsRef.current = true;
    } catch (error) {
      showToast(t('failed_to_load_details'), 'error');
      NavigationService.goBack();
    } finally {
      setIsLoading(false);
      setIsVariantLoading(false);
    }
  }, [productId, showToast, t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

      // console.log('product details is', productDetails);

  useEffect(() => {
    if (!productDetails?.offer?.end_time) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(productDetails.offer.end_time).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Ended');
        clearInterval(interval);
      } else {
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [productDetails]);

  const availableUnitOptions = useMemo((): UnitOptionRow[] => {
    const raw = productDetails?.available_unit_options;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw as UnitOptionRow[];
  }, [productDetails?.available_unit_options]);

  const selectionKey = useMemo(() => {
    if (!productDetails) return '';
    const active = resolveActiveInShopId(productDetails, productId);
    if (!availableUnitOptions.length) return active;
    const hit = availableUnitOptions.some(
      o => String(o.in_shop_id) === active,
    );
    if (hit) return active;
    const routeHit = availableUnitOptions.some(
      o => String(o.in_shop_id) === String(productId),
    );
    if (routeHit) return String(productId);
    return active;
  }, [productDetails, availableUnitOptions, productId]);

  useEffect(() => {
    if (!selectionKey) return;
    setCurrentQuantity(1);
  }, [selectionKey]);

  const currentUnitLabel = useMemo(() => {
    if (!productDetails) return '';
    const fromDetail =
      productDetails.unit_name || productDetails.variant_unit_name;
    if (fromDetail) return fromDetail;
    const match = availableUnitOptions.find(
      o => String(o.in_shop_id) === selectionKey,
    );
    return match?.unit_name ?? '';
  }, [productDetails, availableUnitOptions, selectionKey]);

  const lineTotal = useMemo(() => {
    if (!productDetails) return 0;
    const unit = parseFloat(
      String(
        productDetails.offer_price ??
          productDetails.sale_price ??
          productDetails.price ??
          0,
      ),
    );
    return unit * currentQuantity;
  }, [productDetails, currentQuantity]);

  const pricing = useMemo(() => {
    if (!productDetails) {
      return {
        unitPrice: 0,
        originalUnitPrice: 0,
        hasOfferPrice: false,
      };
    }
    const unitPrice = parseFloat(
      String(
        productDetails.offer_price ??
          productDetails.sale_price ??
          productDetails.price ??
          0,
      ),
    );
    const originalUnitPrice = parseFloat(
      String(
        productDetails.original_price ??
          productDetails.sale_price ??
          productDetails.price ??
          0,
      ),
    );

    const hasOfferPrice =
      productDetails.offer_price != null &&
      String(productDetails.offer_price).trim() !== '' &&
      !Number.isNaN(unitPrice) &&
      unitPrice > 0 &&
      !Number.isNaN(originalUnitPrice) &&
      originalUnitPrice > unitPrice;

    return {
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      originalUnitPrice: Number.isFinite(originalUnitPrice)
        ? originalUnitPrice
        : 0,
      hasOfferPrice,
    };
  }, [productDetails]);

  const mainProductInStock = useMemo(
    () => isStockAvailable(productDetails?.stock_status),
    [productDetails?.stock_status],
  );

  const handleSelectUnitOption = useCallback(
    (option: UnitOptionRow) => {
      if (!isStockAvailable(option.stock_status)) return;
      if (String(option.in_shop_id) === selectionKey) return;
      navigation.setParams({id: option.in_shop_id});
    },
    [navigation, selectionKey],
  );

  const unitOptionRows = useMemo(() => {
    const rows: UnitOptionRow[][] = [];
    for (let i = 0; i < availableUnitOptions.length; i += 2) {
      rows.push(availableUnitOptions.slice(i, i + 2));
    }
    return rows;
  }, [availableUnitOptions]);

  const renderUnitOptions = () => {
    if (availableUnitOptions.length === 0) return null;

    return (
      <View style={styles.unitOptionsSection}>
        <View style={styles.unitOptionsHeaderRow}>
          <Text style={styles.unitOptionsTitle}>{t('select_unit')}</Text>
          {isVariantLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null}
        </View>
        <View style={styles.unitGridListContent}>
          {unitOptionRows.map((row, rowIndex) => (
            <View key={`unit-row-${rowIndex}`} style={styles.unitGridRow}>
              {row.map(option => {
                const available = isStockAvailable(option.stock_status);
                const selected = String(option.in_shop_id) === selectionKey;
                return (
                  <UnitOptionCard
                    key={option.in_shop_id}
                    option={option}
                    selected={selected}
                    available={available}
                    onPress={() => handleSelectUnitOption(option)}
                    styles={styles}
                    cardWidth={unitCardWidth}
                    cardMinHeight={UNIT_CARD_MIN_HEIGHT}
                  />
                );
              })}
              {row.length === 1 ? (
                <View style={{width: unitCardWidth}} />
              ) : null}
            </View>
          ))}
        </View>
        <View style={styles.orderTotalBar}>
          <Text style={styles.orderTotalLabel}>{t('total_amount')}</Text>
          <View style={styles.orderTotalRight}>
            <Text style={styles.orderTotalValue}>
              AED {lineTotal.toFixed(2)}
            </Text>
            {currentUnitLabel ? (
              <Text style={styles.orderTotalUnit} numberOfLines={1}>
                {currentQuantity} × AED{' '}
                {pricing.unitPrice.toFixed(2)}{' '}
                / {currentUnitLabel}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const getApiTranslatedContent = () => {
    if (!productDetails) return {title: '', description: ''};
    const currentLang = i18n.language;
    const apiTrans = productDetails.translations?.[currentLang];
    return {
      title: apiTrans?.title || productDetails.title || 'N/A',
      description: apiTrans?.description || productDetails.description || '',
    };
  };

  const {title: displayTitle, description: displayDescription} =
    getApiTranslatedContent();
  const isFav = productDetails
    ? isInWishlist(productDetails.id) || productDetails.is_in_wishlist
    : false;

  const handleToggleWishlist = async () => {
    const wasFav = isFav;
    try {
      await toggleWishlist(productDetails);
    } catch (error) {
      showToast(
        wasFav ? t('failed_remove_wishlist') : t('failed_add_wishlist'),
        'error',
      );
    }
  };

  const handleShare = async () => {
    if (!productDetails) return;
    try {
      await Share.share({
        message: `${t('share_msg')} ${displayTitle}! AED ${
          productDetails.sale_price
        }`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = async (quantity: number) => {
    try {
      await addItem(productDetails, quantity);
      showToast(`${displayTitle} ${t('added_to_cart_msg')}`, 'success');
    } catch (error) {
      showToast(t('failed_add_item'), 'error');
    }
  };

  const handleBuyNow = async (quantity: number) => {
    try {
      await addItem(productDetails, quantity);
      navigation.navigate('CartStack');
    } catch (error) {
      showToast(t('failed_add_item'), 'error');
    }
  };

  const renderOfferCard = () => {
    const offer = productDetails?.offer;
    if (!offer || !offer.discount_text) return null;

    return (
      <View style={styles.offerCard}>
        <View style={styles.offerAccent} />
        <View style={styles.offerContent}>
          <View style={styles.offerHeaderRow}>
            <Icon xml={SVG_ICONS.promoTagIcon} size={24} color="#F87171" />
            <View>
              <Text style={styles.offerDiscountText}>
                {offer.discount_text}
              </Text>
              <Text style={styles.offerSubtitleText}>
                {offer.subtitle || "TODAY'S SPECIAL DEALS"}
              </Text>
            </View>
          </View>
          {timeLeft !== '' && (
            <View style={styles.timerRow}>
              <Icon xml={SVG_ICONS.timer} size={14} color="#F87171" />
              <Text style={styles.timerText}>Ends in {timeLeft}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderVolumePricing = () => {
    if (!productDetails?.slab_prices || productDetails.slab_prices.length === 0)
      return null;

    const basePrice = parseFloat(productDetails.sale_price);
    const sortedSlabs = [...productDetails.slab_prices].sort(
      (a, b) => a.min_quantity - b.min_quantity,
    );

    let activeSlabIndex = -1;
    for (let i = sortedSlabs.length - 1; i >= 0; i--) {
      if (currentQuantity >= sortedSlabs[i].min_quantity) {
        activeSlabIndex = i;
        break;
      }
    }

    const nextSlab = sortedSlabs.find(s => s.min_quantity > currentQuantity);

    return (
      <View style={styles.slabWrapper}>
        <View style={styles.slabHeader}>
          <Icon xml={SVG_ICONS.promoTagIcon} size={18} color={colors.primary} />
          <Text style={styles.slabTitle}>{t('volume_pricing')}</Text>
        </View>

        <View style={styles.slabContainer}>
          {/* Base Tier */}
          <View
            style={[
              styles.slabRow,
              activeSlabIndex === -1 && styles.activeSlab,
            ]}>
            <View style={styles.slabLeft}>
              <View
                style={[
                  styles.radio,
                  activeSlabIndex === -1 && styles.radioActive,
                ]}
              />
              <Text
                style={[
                  styles.slabQtyText,
                  activeSlabIndex === -1 && styles.activeText,
                ]}
                numberOfLines={1}>
                1 – {sortedSlabs[0].min_quantity - 1} {t('units')}
              </Text>
            </View>
            <View style={styles.slabRight}>
              {activeSlabIndex === -1 && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>{t('CURRENT')}</Text>
                </View>
              )}
              <Text
                style={[
                  styles.slabPrice,
                  activeSlabIndex === -1 && styles.activeText,
                ]}>
                AED {basePrice.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Slabs */}
          {sortedSlabs.map((slab, index) => {
            const isActive = activeSlabIndex === index;
            const savings = (basePrice - parseFloat(slab.price)).toFixed(2);

            return (
              <View
                key={slab.id}
                style={[styles.slabRow, isActive && styles.activeSlab]}>
                <View style={styles.slabLeft}>
                  <View
                    style={[styles.radio, isActive && styles.radioActive]}
                  />
                  <Text
                    style={[styles.slabQtyText, isActive && styles.activeText]}
                    numberOfLines={1}>
                    {slab.min_quantity}+ {t('units')}
                  </Text>
                </View>
                <View style={styles.slabRight}>
                  {isActive && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>
                        {t('CURRENT')}
                      </Text>
                    </View>
                  )}
                  <View style={styles.priceColumn}>
                    <Text
                      style={[styles.slabPrice, isActive && styles.activeText]}>
                      AED {parseFloat(slab.price).toFixed(2)}
                    </Text>
                    <View style={styles.saveBadge}>
                      <Text style={styles.saveBadgeText}>
                        {t('save')} {savings}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {nextSlab && (
          <View style={styles.slabTip}>
            <Text style={styles.tipText}>
              💡 {t('add')}{' '}
              <Text style={styles.tipHighlight}>
                {nextSlab.min_quantity - currentQuantity} {t('more')}
              </Text>{' '}
              {t('to_get')}{' '}
              <Text style={styles.tipHighlight}>
                AED {parseFloat(nextSlab.price).toFixed(2)}
              </Text>{' '}
              {t('per_unit')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSpecs = () => {
    const specs = [
      {label: t('sku'), value: productDetails?.variant_sku || 'N/A'},
      {label: t('category'), value: productDetails?.category || 'General'},
      {
        label: t('storage'),
        value: productDetails?.storage_condition || 'Room Temp',
      },
      {label: t('origin'), value: 'UAE Local Farms'},
      {label: t('delivery'), value: 'Express'},
    ];

    return (
      <View style={styles.specsContainer}>
        {specs.map((item, index) => (
          <View
            key={index}
            style={[
              styles.specRow,
              index === specs.length - 1 && {borderBottomWidth: 0},
            ]}>
            <Text style={styles.specLabel}>{item.label}</Text>
            <Text style={styles.specValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading || !productDetails) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageHeader}>
          <FlatList
            data={productDetails.image_urls}
            horizontal
            pagingEnabled
            onScroll={e =>
              setActiveIndex(
                Math.round(e.nativeEvent.contentOffset.x / windowWidth),
              )
            }
            renderItem={({item}) => (
              <Image
                source={{uri: item.url || item}}
                style={styles.carouselImage}
              />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => NavigationService.goBack()}>
              <Icon xml={SVG_ICONS.backIcon} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconCircle} onPress={handleShare}>
                <Icon xml={SVG_ICONS.shareIcon} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.iconCircle,
                  {
                    marginLeft: 12,
                    backgroundColor: isFav ? colors.danger : colors.surface,
                  },
                ]}
                onPress={handleToggleWishlist}>
                <Icon
                  xml={SVG_ICONS.heart}
                  color={isFav ? 'white' : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.dragHandle} />
          <View style={styles.headerRow}>
            <View style={styles.expressTag}>
              <Icon xml={SVG_ICONS.flashIcon} size={10} color="white" />
              <Text style={styles.expressText}>{t('express')}</Text>
            </View>
            <Text style={styles.categoryLabel}>
              {productDetails.category?.toUpperCase()}
            </Text>
            <View style={styles.priceHeaderRight}>
              <Text style={styles.currentPrice}>
                AED {pricing.unitPrice.toFixed(2)}
              </Text>
              {pricing.hasOfferPrice ? (
                <Text style={styles.originalPrice} numberOfLines={1}>
                  AED {pricing.originalUnitPrice.toFixed(2)}
                </Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.productTitle}>{displayTitle}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              {productDetails.rating} ({productDetails.reviews_count || 0}{' '}
              {t('reviews')})
            </Text>
            <View style={styles.verticalDivider} />
            <Text
              style={[
                styles.stockText,
                {
                  color: mainProductInStock ? colors.success : colors.danger,
                },
              ]}>
              {mainProductInStock ? t('in_stock') : t('out_of_stock')}
            </Text>
          </View>

          {renderUnitOptions()}
          {renderOfferCard()}
          {renderVolumePricing()}

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>{t('description')}</Text>
          <Text style={styles.descriptionText}>
            {displayDescription || t('no_description_available')}
          </Text>

          <Text style={styles.sectionTitle}>{t('product_specifications')}</Text>
          {renderSpecs()}

          <View style={styles.footerSpace} />
        </View>
      </ScrollView>

      <ProductActionBar
        isOutOfStock={!mainProductInStock}
        handleAddCart={handleAddToCart}
        handleBuyNow={handleBuyNow}
        loading={loading}
        onQuantityChange={(q: number) => setCurrentQuantity(q)}
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any, isDark: boolean, winW: number) =>
  StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    imageHeader: {height: winW * 1.1, backgroundColor: 'white'},
    carouselImage: {width: winW, height: '100%', resizeMode: 'cover'},
    rightIcons: {flexDirection: 'row'},
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 5,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    contentCard: {
      marginTop: -40,
      backgroundColor: colors.background,
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      padding: 25,
      minHeight: 500,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    headerRow: {flexDirection: 'row', alignItems: 'center'},
    expressTag: {
      flexDirection: 'row',
      backgroundColor: '#2563EB',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignItems: 'center',
      gap: 3,
      marginRight: 10,
    },
    expressText: {color: '#fff', fontSize: 10, fontWeight: 'bold'},
    categoryLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '800',
      flex: 1,
    },
    priceHeaderRight: {alignItems: 'flex-end', justifyContent: 'center'},
    currentPrice: {color: colors.danger, fontSize: 28, fontWeight: '800'},
    originalPrice: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '700',
      textDecorationLine: 'line-through',
      marginTop: 2,
      opacity: 0.8,
    },
    productTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 10,
    },
    ratingRow: {flexDirection: 'row', alignItems: 'center', marginTop: 15},
    ratingText: {color: colors.textMuted, fontSize: 14, fontWeight: '500'},
    stockText: {fontSize: 14, fontWeight: 'bold'},
    divider: {
      height: 1,
      marginVertical: 15,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      marginTop: 25,
    },
    descriptionText: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 5,
    },
    specsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 20,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    specRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    specLabel: {color: colors.textMuted, fontSize: 15},
    specValue: {color: colors.text, fontSize: 15, fontWeight: '700'},
    verticalDivider: {
      width: 1,
      height: 15,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    },
    footerSpace: {height: 120},
    navButtons: {
      position: 'absolute',
      top: 50,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      zIndex: 10,
    },
    offerCard: {
      marginTop: 20,
      flexDirection: 'row',
      backgroundColor: isDark
        ? 'rgba(248, 113, 113, 0.05)'
        : 'rgba(248, 113, 113, 0.03)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(248, 113, 113, 0.2)',
      overflow: 'hidden',
    },
    offerAccent: {width: 4, backgroundColor: '#F87171'},
    offerContent: {flex: 1, padding: 16},
    offerHeaderRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
    offerDiscountText: {fontSize: 18, fontWeight: '900', color: '#F87171'},
    offerSubtitleText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginTop: 2,
    },
    timerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
    },
    timerText: {fontSize: 16, fontWeight: 'bold', color: '#F87171'},

    // Responsive Slab Styles
    slabWrapper: {
      marginTop: 25,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRadius: 20,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    slabHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    slabTitle: {color: colors.text, fontSize: 16, fontWeight: 'bold'},
    slabContainer: {gap: 8},
    slabRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 52,
    },
    activeSlab: {
      borderColor: colors.primary,
      backgroundColor: isDark
        ? 'rgba(37, 99, 235, 0.1)'
        : 'rgba(37, 99, 235, 0.05)',
    },
    slabLeft: {
      flex: 1.2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginRight: 4,
    },
    radio: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: colors.textMuted,
    },
    radioActive: {backgroundColor: colors.primary, borderColor: colors.primary},
    slabQtyText: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
      flexShrink: 1,
    },
    activeText: {color: colors.primary},
    slabRight: {
      flex: 1.8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 6,
    },
    priceColumn: {alignItems: 'flex-end', justifyContent: 'center'},
    currentBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 6,
    },
    currentBadgeText: {color: 'white', fontSize: 9, fontWeight: 'bold'},
    slabPrice: {fontSize: 14, fontWeight: 'bold', color: colors.text},
    saveBadge: {
      backgroundColor: isDark ? '#064e3b' : '#dcfce7',
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
      marginTop: 2,
    },
    saveBadgeText: {color: '#10b981', fontSize: 9, fontWeight: 'bold'},
    slabTip: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderStyle: 'dashed',
    },
    tipText: {fontSize: 12, color: colors.textMuted, lineHeight: 18},
    tipHighlight: {color: colors.primary, fontWeight: 'bold'},

    unitOptionsSection: {marginTop: 20},
    unitOptionsHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    unitOptionsTitle: {color: colors.text, fontSize: 18, fontWeight: 'bold'},
    unitGridListContent: {paddingTop: 8, paddingBottom: 4},
    unitGridRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: UNIT_COL_GAP,
      columnGap: UNIT_COL_GAP,
    },
    unitOptionCard: {
      borderRadius: 14,
      padding: 12,
      borderWidth: 2,
      backgroundColor: colors.surface,
    },
    unitOptionBody: {
      flex: 1,
      justifyContent: 'space-between',
    },
    unitOptionCardNeutral: {borderColor: colors.border},
    unitOptionCardSelected: {
      borderColor: colors.success,
      backgroundColor: isDark
        ? 'rgba(16, 185, 129, 0.12)'
        : 'rgba(16, 185, 129, 0.06)',
    },
    unitOptionCardSelectedOos: {
      borderColor: colors.danger,
      backgroundColor: isDark
        ? 'rgba(239, 68, 68, 0.1)'
        : 'rgba(239, 68, 68, 0.06)',
    },
    unitOptionCardUnavailable: {
      borderColor: colors.danger,
      opacity: 0.85,
    },
    unitOptionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    unitOptionName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    unitOptionTextMuted: {opacity: 0.65},
    unitPacking: {fontSize: 12, color: colors.textMuted, marginTop: 4},
    unitSku: {fontSize: 12, color: colors.textMuted, marginTop: 4},
    unitPrice: {fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 8},
    unitPriceMuted: {color: colors.textMuted},
    unitStockLabel: {fontSize: 12, fontWeight: '600', marginTop: 6},
    unitStockIn: {color: colors.success},
    unitStockOut: {color: colors.danger},
    baseBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    baseBadgeText: {color: '#fff', fontSize: 10, fontWeight: 'bold'},
    orderTotalBar: {
      marginTop: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    orderTotalLabel: {fontSize: 14, fontWeight: '600', color: colors.textMuted},
    orderTotalRight: {alignItems: 'flex-end', flex: 1, marginLeft: 12},
    orderTotalValue: {fontSize: 18, fontWeight: '800', color: colors.text},
    orderTotalUnit: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
      textAlign: 'right',
    },
  });

export default ProductDetailsScreen;
