package com.abreco

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. 
   * This is used to schedule rendering of the component.
   */
  override fun getMainComponentName(): String = "Abreco"

  /**
   * Called when the activity is first created.
   * Required for react-native-bootsplash and to prevent 
   * crashes related to React Navigation.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
  RNBootSplash.init(this, R.style.BootTheme); // 1. Initialize Splash
    super.onCreate(null); // Passing null prevents Fragment recovery crashes on navigation
  }

  /**
   * Returns the instance of the [ReactActivityDelegate].
   * We use [DefaultReactActivityDelegate] which is compatible with RN 0.73.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, false)
}