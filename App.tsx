import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { AppProvider, useApp } from "./src/AppContext";
import LoginScreen from "./src/screens/LoginScreen";
import HomeDashboard from "./src/screens/HomeDashboard";
import TranslatorScreen from "./src/screens/TranslatorScreen";
import AssistantScreen from "./src/screens/AssistantScreen";
import CommunityScreen from "./src/screens/CommunityScreen";
import TasksScreen from "./src/screens/TasksScreen";
import JournalScreen from "./src/screens/JournalScreen";

const Stack = createNativeStackNavigator();

function Screens() {
  const { ready, user } = useApp();

  // Wait for the saved session so a signed-in user goes straight to Home.
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f3faff" }}>
        <ActivityIndicator color="#005dac" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={user ? "Home" : "Login"}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeDashboard} />
        <Stack.Screen name="Translator" component={TranslatorScreen} />
        <Stack.Screen name="Assistant" component={AssistantScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
        <Stack.Screen name="Journal" component={JournalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Screens />
      </AppProvider>
    </SafeAreaProvider>
  );
}
