// components/FeatureButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type FeatureButtonProps = {
  title: string;
  icon: string;
  onPress: () => void;
};

export default function FeatureButton({ title, icon, onPress }: FeatureButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Icon name={icon} size={28} color="#fff" />
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 120,
    margin: 8,
    elevation: 3,
  },
  title: {
    marginTop: 8,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});
