import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { api } from "../../../convex/_generated/api";
import { styles } from "../../styles/profile.styles";

export default function Profile() {
  const { signOut } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const posts = useQuery(api.posts.getPostsByUser, {});
  const updateProfile = useMutation(api.users.updateProfile);

  const [editedProfile, setEditedProfile] = useState({
    fullname: "",
    username: "",
    bio: "",
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (currentUser === undefined || posts === undefined) return <Loader />;
  if (currentUser === null) return <Loader />;

  const openEditModal = () => {
    setEditedProfile({
      fullname: currentUser.fullname,
      username: currentUser.username,
      bio: currentUser.bio ?? "",
    });
    setEditError(null);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setEditError(null);
    try {
      await updateProfile({
        fullname: editedProfile.fullname.trim(),
        username: editedProfile.username,
        bio: editedProfile.bio.trim() || undefined,
      });
      setIsEditModalVisible(false);
    } catch (error) {
      setEditError(
        error instanceof ConvexError
          ? (error.data as string)
          : "Couldn't save your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{currentUser.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        numColumns={3}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={
          <View style={styles.profileInfo}>
            {/* AVATAR & STATS */}
            <View style={styles.avatarAndStats}>
              <View style={styles.avatarContainer}>
                <Image
                  source={currentUser.image}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={200}
                />
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{currentUser.posts}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{currentUser.followers}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{currentUser.following}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>

            <Text style={styles.name}>{currentUser.fullname}</Text>
            {currentUser.bio && (
              <Text style={styles.bio}>{currentUser.bio}</Text>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={openEditModal}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={<NoPostsFound />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() =>
              router.push({
                pathname: "/posts/[userId]",
                params: { userId: currentUser._id, postId: item._id },
              })
            }
          >
            <Image
              source={item.imageUrl}
              style={styles.gridImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
        )}
      />

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.fullname}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, fullname: text }))
                  }
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.username}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, username: text }))
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={30}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editedProfile.bio}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, bio: text }))
                  }
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              {editError && <Text style={styles.errorText}>{editError}</Text>}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={
                  isSaving ||
                  !editedProfile.fullname.trim() ||
                  !editedProfile.username.trim()
                }
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function NoPostsFound() {
  return (
    <View style={styles.noPostsContainer}>
      <Ionicons name="images-outline" size={48} color={COLORS.primary} />
      <Text style={styles.noPostsText}>No posts yet</Text>
    </View>
  );
}
