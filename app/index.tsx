import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Inspectrix v3!</Text>
      <Button
        mode="contained"
        onPress={() => router.push("/auth" as any)}
        style={styles.button}
      >
        Go to Auth
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
});
