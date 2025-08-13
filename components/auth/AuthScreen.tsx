import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LoginScreen } from "./LoginScreen";
import { RegisterScreen } from "./RegisterScreen";

type AuthMode = "login" | "register";

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {mode === "login" ? (
        <LoginScreen onSwitchToRegister={() => setMode("register")} />
      ) : (
        <RegisterScreen onSwitchToLogin={() => setMode("login")} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
