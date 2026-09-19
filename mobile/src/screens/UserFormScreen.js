import { useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { createUser, updateUser } from "../api";
import { colors } from "../theme";

export default function UserFormScreen({ route, navigation }) {
  const user = route.params?.user;
  const isEditing = Boolean(user);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params?.title ?? "Usuario" });
  }, [navigation, route.params?.title]);

  const validate = () => {
    if (name.trim().length < 2)
      return "El nombre debe tener al menos 2 caracteres";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Escribe un email válido";
    if (phone.trim() && !/^\d{7,15}$/.test(phone.trim())) 
      return "El teléfono debe tener entre 7 y 15 dígitos";
    return null;
  };

  const save = async () => {
    const problem = validate();

    if (problem) {
      return Alert.alert("Revisa el formulario", problem);
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      is_active: isActive,
    };

    try {
      setSaving(true);
      if (isEditing) await updateUser(user.id, payload);
      else await createUser(payload);
      navigation.goBack(); // la lista se recarga sola al volver (useFocusEffect)
    } catch (e) {
      Alert.alert("No se pudo guardar", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ana Pérez"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="ana@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Teléfono (opcional)</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="300 123 4567"
          keyboardType="phone-pad"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Usuario activo</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ true: colors.primary }}
          />
        </View>

        <Pressable
          style={[styles.button, saving && { opacity: 0.6 }]}
          onPress={save}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isEditing ? "Guardar cambios" : "Crear usuario"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
  },
  switchLabel: { fontSize: 16, color: colors.text },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 32,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
