import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { useAuth } from "./AuthContext";
import { RegisterCredentials } from "../../types/auth";

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onSwitchToLogin,
}) => {
  const theme = useTheme();
  const { signUp, loading } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: "",
    password: "",
    fullName: "",
    company: "",
    role: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<
    Partial<RegisterCredentials & { confirmPassword: string }>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<
      RegisterCredentials & { confirmPassword: string }
    > = {};

    // Email validation
    if (!credentials.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!credentials.password) {
      newErrors.password = "Password is required";
    } else if (credentials.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(credentials.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== credentials.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Full name validation
    if (!credentials.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (credentials.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    // Company validation (optional)
    if (credentials.company && credentials.company.trim().length < 2) {
      newErrors.company = "Company name must be at least 2 characters";
    }

    // Role validation (optional)
    if (credentials.role && credentials.role.trim().length < 2) {
      newErrors.role = "Role must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    const { error } = await signUp(credentials);

    if (error) {
      Alert.alert("Registration Failed", error.message);
    } else {
      Alert.alert(
        "Registration Successful",
        "Please check your email to verify your account.",
        [{ text: "OK", onPress: onSwitchToLogin }]
      );
    }
  };

  const updateCredentials = (
    field: keyof RegisterCredentials,
    value: string
  ) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>Create Account</Title>
            <Paragraph style={styles.subtitle}>
              Join Inspectrix to start creating inspection reports
            </Paragraph>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Full Name"
              value={credentials.fullName}
              onChangeText={(text) => updateCredentials("fullName", text)}
              mode="outlined"
              autoCapitalize="words"
              autoComplete="name"
              error={!!errors.fullName}
              disabled={loading}
              style={styles.input}
            />
            {errors.fullName && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.fullName}
              </Text>
            )}

            <TextInput
              label="Email"
              value={credentials.email}
              onChangeText={(text) => updateCredentials("email", text)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={!!errors.email}
              disabled={loading}
              style={styles.input}
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.email}
              </Text>
            )}

            <TextInput
              label="Company (Optional)"
              value={credentials.company}
              onChangeText={(text) => updateCredentials("company", text)}
              mode="outlined"
              autoCapitalize="words"
              error={!!errors.company}
              disabled={loading}
              style={styles.input}
            />
            {errors.company && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.company}
              </Text>
            )}

            <TextInput
              label="Role (Optional)"
              value={credentials.role}
              onChangeText={(text) => updateCredentials("role", text)}
              mode="outlined"
              autoCapitalize="words"
              error={!!errors.role}
              disabled={loading}
              style={styles.input}
              placeholder="e.g., Equipment Inspector, Safety Manager"
            />
            {errors.role && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.role}
              </Text>
            )}

            <TextInput
              label="Password"
              value={credentials.password}
              onChangeText={(text) => updateCredentials("password", text)}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoComplete="password"
              error={!!errors.password}
              disabled={loading}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {errors.password && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.password}
              </Text>
            )}

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={updateConfirmPassword}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              error={!!errors.confirmPassword}
              disabled={loading}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />
            {errors.confirmPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.confirmPassword}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              disabled={loading}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? <ActivityIndicator color="white" /> : "Create Account"}
            </Button>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Button
                mode="text"
                onPress={onSwitchToLogin}
                disabled={loading}
                compact
                labelStyle={styles.linkText}
              >
                Sign in here
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "transparent",
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginLeft: 12,
  },
  registerButton: {
    marginTop: 10,
  },
  buttonContent: {
    height: 50,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
