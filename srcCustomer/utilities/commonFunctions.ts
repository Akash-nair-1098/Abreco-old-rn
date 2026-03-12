import { useNavigationState } from "@react-navigation/native";

export const currentRouteName = useNavigationState(state => {
  const route = state.routes[state.index];
  return route.name;
});

