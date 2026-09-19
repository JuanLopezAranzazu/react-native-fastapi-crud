import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { deleteUser, getUsers } from "../api";
import { colors } from "../theme";

export default function UserListScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Debounce: espera 400 ms después de que el usuario deja de escribir
  // para no llamar a la API en cada letra.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setError(null);
      setUsers(await getUsers(debouncedSearch));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch]);

  // Se ejecuta cada vez que la pantalla gana foco (al volver del formulario
  // la lista se recarga sola) y cuando cambia la búsqueda.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Botón "Nuevo" en la cabecera
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() =>
            navigation.navigate("UserForm", { title: "Nuevo usuario" })
          }
        >
          <Text style={styles.headerButton}>Nuevo</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const confirmDelete = (user) => {
    Alert.alert(
      "Eliminar usuario",
      `¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user.id);
              // Actualizamos el estado local sin volver a pedir toda la lista
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
            } catch (e) {
              Alert.alert("No se pudo eliminar", e.message);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate("UserForm", {
          user: item,
          title: "Editar usuario",
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.detail} numberOfLines={1} ellipsizeMode="tail">
          {item.email}
        </Text>

        {item.phone ? (
          <Text style={styles.detail} numberOfLines={1}>
            {item.phone}
          </Text>
        ) : null}

        <Text style={styles.detail}>
          Creado: {new Date(item.created_at).toLocaleDateString("es-CO")}
        </Text>

        <Text
          style={[
            styles.status,
            { color: item.is_active ? colors.success : colors.muted },
          ]}
        >
          {item.is_active ? "Activo" : "Inactivo"}
        </Text>
      </View>

      <Pressable
        style={styles.deleteButton}
        onPress={() => confirmDelete(item)}
        hitSlop={10}
      >
        <Text style={styles.delete}>Eliminar</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Buscar por nombre o email"
        placeholderTextColor={colors.muted}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retry} onPress={load}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => String(u.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {debouncedSearch
                ? "No hay usuarios que coincidan con la búsqueda."
                : "Aún no hay usuarios. Toca “Nuevo” para crear el primero."}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  headerButton: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  search: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6ECFD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: colors.primary, fontSize: 18, fontWeight: "700" },
  info: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  detail: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  status: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  deleteButton: {
    width: 70,
    alignItems: "flex-end",
  },
  delete: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 48,
    lineHeight: 22,
  },
  center: { alignItems: "center", marginTop: 48 },
  errorText: { color: colors.danger, textAlign: "center", marginBottom: 12 },
  retry: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },
});
