import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  SegmentedButtons,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

interface InspectionForm {
  equipmentId: string;
  equipmentType: string;
  location: string;
  priority: "Low" | "Medium" | "High";
  description: string;
  notes: string;
}

export default function CreateReportScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<InspectionForm>({
    equipmentId: "",
    equipmentType: "",
    location: "",
    priority: "Medium",
    description: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<InspectionForm>>({});

  const priorityOptions = [
    { value: "Low", label: "Low", icon: "keyboard-arrow-down" },
    { value: "Medium", label: "Medium", icon: "remove" },
    { value: "High", label: "High", icon: "keyboard-arrow-up" },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<InspectionForm> = {};

    if (!form.equipmentId.trim()) {
      newErrors.equipmentId = "Equipment ID is required";
    }

    if (!form.equipmentType.trim()) {
      newErrors.equipmentType = "Equipment type is required";
    }

    if (!form.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert("Success", "Inspection report created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setForm({
              equipmentId: "",
              equipmentType: "",
              location: "",
              priority: "Medium",
              description: "",
              notes: "",
            });
            setErrors({});
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to create inspection report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof InspectionForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
            <MaterialIcons
              name="assignment"
              size={32}
              color={theme.colors.primary}
            />
            <Title style={styles.title}>New Inspection Report</Title>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Equipment ID *"
              value={form.equipmentId}
              onChangeText={(text) => updateForm("equipmentId", text)}
              mode="outlined"
              error={!!errors.equipmentId}
              disabled={loading}
              style={styles.input}
              placeholder="e.g., EQ-001, PUMP-A23"
            />
            {errors.equipmentId && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.equipmentId}
              </Text>
            )}

            <TextInput
              label="Equipment Type *"
              value={form.equipmentType}
              onChangeText={(text) => updateForm("equipmentType", text)}
              mode="outlined"
              error={!!errors.equipmentType}
              disabled={loading}
              style={styles.input}
              placeholder="e.g., Hydraulic Pump, Conveyor Belt"
            />
            {errors.equipmentType && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.equipmentType}
              </Text>
            )}

            <TextInput
              label="Location *"
              value={form.location}
              onChangeText={(text) => updateForm("location", text)}
              mode="outlined"
              error={!!errors.location}
              disabled={loading}
              style={styles.input}
              placeholder="e.g., Plant A - Bay 2, Building B - Floor 3"
            />
            {errors.location && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.location}
              </Text>
            )}

            <View style={styles.prioritySection}>
              <Text style={styles.fieldLabel}>Priority Level</Text>
              <SegmentedButtons
                value={form.priority}
                onValueChange={(value) =>
                  updateForm("priority", value as "Low" | "Medium" | "High")
                }
                buttons={priorityOptions}
                style={styles.segmentedButtons}
              />
            </View>

            <TextInput
              label="Inspection Description *"
              value={form.description}
              onChangeText={(text) => updateForm("description", text)}
              mode="outlined"
              multiline
              numberOfLines={4}
              error={!!errors.description}
              disabled={loading}
              style={styles.textArea}
              placeholder="Describe the inspection findings, issues discovered, or maintenance needed..."
            />
            {errors.description && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.description}
              </Text>
            )}

            <TextInput
              label="Additional Notes"
              value={form.notes}
              onChangeText={(text) => updateForm("notes", text)}
              mode="outlined"
              multiline
              numberOfLines={3}
              disabled={loading}
              style={styles.textArea}
              placeholder="Any additional observations, recommendations, or follow-up actions..."
            />

            <View style={styles.photoSection}>
              <Text style={styles.fieldLabel}>Photos</Text>
              <Button
                mode="outlined"
                icon="camera"
                onPress={() =>
                  Alert.alert(
                    "Coming Soon",
                    "Photo capture will be implemented next!"
                  )
                }
                disabled={loading}
                style={styles.photoButton}
              >
                Add Photos
              </Button>
              <Text
                style={[
                  styles.helperText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Capture images of equipment condition and any issues found
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                "Create Inspection Report"
              )}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 12,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "transparent",
  },
  textArea: {
    backgroundColor: "transparent",
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginLeft: 12,
  },
  prioritySection: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  segmentedButtons: {
    marginTop: 4,
  },
  photoSection: {
    gap: 8,
  },
  photoButton: {
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  submitButton: {
    marginTop: 16,
  },
  buttonContent: {
    height: 50,
  },
});
