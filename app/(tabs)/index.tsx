import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Chip,
  FAB,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

// Mock data for reports
const mockReports = [
  {
    id: "1",
    equipmentId: "EQ-001",
    equipmentType: "Hydraulic Pump",
    location: "Plant A - Bay 2",
    status: "Completed",
    priority: "High",
    inspectorName: "John Smith",
    createdAt: "2025-01-15",
    lastInspection: "2024-12-15",
  },
  {
    id: "2",
    equipmentId: "EQ-002",
    equipmentType: "Conveyor Belt",
    location: "Plant B - Line 1",
    status: "In Progress",
    priority: "Medium",
    inspectorName: "Sarah Johnson",
    createdAt: "2025-01-14",
    lastInspection: "2024-11-20",
  },
  {
    id: "3",
    equipmentId: "EQ-003",
    equipmentType: "Safety Valve",
    location: "Plant A - Section C",
    status: "Pending",
    priority: "Low",
    inspectorName: "Mike Davis",
    createdAt: "2025-01-13",
    lastInspection: "2024-10-30",
  },
];

export default function ReportsScreen() {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return theme.colors.tertiary;
      case "In Progress":
        return theme.colors.secondary;
      case "Pending":
        return theme.colors.outline;
      default:
        return theme.colors.outline;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return theme.colors.error;
      case "Medium":
        return theme.colors.secondary;
      case "Low":
        return theme.colors.tertiary;
      default:
        return theme.colors.outline;
    }
  };

  const handleCreateReport = () => {
    try {
      router.push("/create" as any);
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {mockReports.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="assignment"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.emptyText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              No inspection reports yet
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Create your first inspection report using the + button
            </Text>
          </View>
        ) : (
          mockReports.map((report) => (
            <Card key={report.id} style={styles.reportCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.titleSection}>
                    <Title style={styles.equipmentId}>
                      {report.equipmentId}
                    </Title>
                    <Paragraph style={styles.equipmentType}>
                      {report.equipmentType}
                    </Paragraph>
                  </View>
                  <View style={styles.statusSection}>
                    <Chip
                      mode="outlined"
                      textStyle={{ fontSize: 12 }}
                      style={[
                        styles.statusChip,
                        { borderColor: getStatusColor(report.status) },
                      ]}
                    >
                      {report.status}
                    </Chip>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <MaterialIcons
                      name="location-on"
                      size={16}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.infoText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {report.location}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialIcons
                      name="person"
                      size={16}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.infoText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {report.inspectorName}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialIcons
                      name="schedule"
                      size={16}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.infoText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      Created: {new Date(report.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialIcons
                      name="history"
                      size={16}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.infoText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      Last inspection:{" "}
                      {new Date(report.lastInspection).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Chip
                    mode="outlined"
                    textStyle={{ fontSize: 11 }}
                    style={[
                      styles.priorityChip,
                      { borderColor: getPriorityColor(report.priority) },
                    ]}
                  >
                    {report.priority} Priority
                  </Chip>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreateReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Account for FAB
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  reportCard: {
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  statusSection: {
    marginLeft: 12,
  },
  equipmentId: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  equipmentType: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusChip: {
    height: 28,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  priorityChip: {
    height: 26,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
