// components/auth/RegisterScreen.tsx
import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
} from "react-native-paper";
import { useAuth } from "./AuthContext";

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export default function RegisterScreen({
  onSwitchToLogin,
}: RegisterScreenProps) {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: "inspector", // Default role
    });

    if (result.success) {
      Alert.alert(
        "Registration Successful!",
        "Welcome to Inspectrix! You can now start using the app.",
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("Registration Error", result.error || "Registration failed");
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Card>
        <Card.Content>
          <Text
            variant="headlineMedium"
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            Create Account
          </Text>

          <TextInput
            label="First Name"
            value={formData.firstName}
            onChangeText={(value) => updateFormData("firstName", value)}
            mode="outlined"
            style={{ marginBottom: 16 }}
            error={!!errors.firstName}
            disabled={loading}
          />
          {errors.firstName && (
            <Text variant="bodySmall" style={{ color: "red", marginBottom: 8 }}>
              {errors.firstName}
            </Text>
          )}

          <TextInput
            label="Last Name"
            value={formData.lastName}
            onChangeText={(value) => updateFormData("lastName", value)}
            mode="outlined"
            style={{ marginBottom: 16 }}
            error={!!errors.lastName}
            disabled={loading}
          />
          {errors.lastName && (
            <Text variant="bodySmall" style={{ color: "red", marginBottom: 8 }}>
              {errors.lastName}
            </Text>
          )}

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData("email", value)}
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
            value={formData.password}
            onChangeText={(value) => updateFormData("password", value)}
            mode="outlined"
            secureTextEntry
            style={{ marginBottom: 16 }}
            error={!!errors.password}
            disabled={loading}
          />
          {errors.password && (
            <Text variant="bodySmall" style={{ color: "red", marginBottom: 8 }}>
              {errors.password}
            </Text>
          )}

          <TextInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData("confirmPassword", value)}
            mode="outlined"
            secureTextEntry
            style={{ marginBottom: 24 }}
            error={!!errors.confirmPassword}
            disabled={loading}
          />
          {errors.confirmPassword && (
            <Text
              variant="bodySmall"
              style={{ color: "red", marginBottom: 16 }}
            >
              {errors.confirmPassword}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={{ marginBottom: 16 }}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : "Create Account"}
          </Button>

          <Button mode="text" onPress={onSwitchToLogin} disabled={loading}>
            Already have an account? Sign In
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
