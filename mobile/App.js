import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import UserListScreen from "./src/screens/UserListScreen";
import UserFormScreen from "./src/screens/UserFormScreen";
import { colors } from "./src/theme";

// El "Stack" es una pila de pantallas: navigate() apila una, goBack() la quita.
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Users" component={UserListScreen} options={{ title: "Usuarios" }} />
        <Stack.Screen name="UserForm" component={UserFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
