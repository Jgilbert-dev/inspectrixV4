// components/auth/LoginScreen.tsx
import React, { useState } from "react";
import { View, Alert } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
} from "react-native-paper";
import { useAuth } from "./AuthContext";

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onSwitchToRegister }: LoginScreenProps) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await login(email.trim(), password);

    if (!result.success) {
      Alert.alert("Login Error", result.error || "Login failed");
    }
    // Success is handled automatically by AuthContext
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <View style={{ padding: 20, justifyContent: "center", flex: 1 }}>
      <Card>
        <Card.Content>
          <Text
            variant="headlineMedium"
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            Welcome Back
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              clearError("email");
            }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 16 }}
            error={!!errors.email}
            disabled={loading}
          />
          {errors.email && (
            <Text variant="bodySmall" style={{ color: "red", marginBottom: 8 }}>
              {errors.email}
            </Text>
          )}

          <TextInput
            label="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearError("password");
            }}
            mode="outlined"
            secureTextEntry
            style={{ marginBottom: 24 }}
            error={!!errors.password}
            disabled={loading}
          />
          {errors.password && (
            <Text
              variant="bodySmall"
              style={{ color: "red", marginBottom: 16 }}
            >
              {errors.password}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            style={{ marginBottom: 16 }}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : "Sign In"}
          </Button>

          <Button mode="text" onPress={onSwitchToRegister} disabled={loading}>
            Don't have an account? Sign Up
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}
