import * as React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { AppProvider, useApp } from "./src/AppContext";
import LoginScreen from "./src/screens/LoginScreen";
import HomeDashboard from "./src/screens/HomeDashboard";
import TranslatorScreen from "./src/screens/TranslatorScreen";
import AssistantScreen from "./src/screens/AssistantScreen";
import CommunityScreen from "./src/screens/CommunityScreen";
import TasksScreen from "./src/screens/TasksScreen";
import JournalScreen from "./src/screens/JournalScreen";
import InfoScreen from "./src/screens/InfoScreen";
import RemittanceScreen from "./src/screens/RemittanceScreen";
import PayslipsScreen from "./src/screens/PayslipsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import WelcomeGuide from "./src/components/WelcomeGuide";
import { tc } from "./src/theme";

const Stack = createNativeStackNavigator();

function Screens() {
  const { ready, user, dark } = useApp();

  // What's behind the app follows the look too: on the phone the window (seen for a moment
  // when a page opens), on the web the browser page (seen when scrolling past the end).
  React.useEffect(() => {
    if (Platform.OS !== "web") {
      SystemUI.setBackgroundColorAsync(tc("#f3faff")).catch(() => { });
      return;
    }
    if (typeof document === "undefined") return;
    document.body.style.backgroundColor = tc("#f3faff");
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);

  // Wait for the saved session so a signed-in user goes straight to Home.
  // Without an account only the login screen exists: there is no guest mode.
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: tc("#f3faff") }}>
        <ActivityIndicator color={tc("#005dac")} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={{ ...(dark ? DarkTheme : DefaultTheme), colors: { ...(dark ? DarkTheme : DefaultTheme).colors, background: tc("#f3faff") } }}>
      {/* The phone's clock and battery: light on the dark look, dark on the light one. */}
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeDashboard} />
            <Stack.Screen name="Translator" component={TranslatorScreen} />
            <Stack.Screen name="Assistant" component={AssistantScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
            <Stack.Screen name="Journal" component={JournalScreen} />
            <Stack.Screen name="Info" component={InfoScreen} />
            <Stack.Screen name="Remittance" component={RemittanceScreen} />
            <Stack.Screen name="Payslips" component={PayslipsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
      {/* Short guide to the bottom-nav buttons, shown after an account's first sign-in. */}
      <WelcomeGuide />
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
