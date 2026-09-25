import { useTheme } from "@/constants/theme";
import { useProfileStyles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import {
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
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type EditCaptionModalProps = {
  postId: Id<"posts">;
  caption?: string;
  visible: boolean;
  onClose: () => void;
};

export default function EditCaptionModal({
  postId,
  caption,
  visible,
  onClose,
}: EditCaptionModalProps) {
  const colors = useTheme();
  const styles = useProfileStyles();
  const updateCaption = useMutation(api.posts.updateCaption);

  const [draft, setDraft] = useState(caption ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // start from the current caption each time the modal opens
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setDraft(caption ?? "");
      setError(null);
    }
  }

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateCaption({ postId, caption: draft });
      onClose();
    } catch (err) {
      setError(
        err instanceof ConvexError
          ? (err.data as string)
          : "Couldn't save your caption. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Caption</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={draft}
                onChangeText={setDraft}
                placeholder="Write a caption..."
                placeholderTextColor={colors.grey}
                multiline
                autoFocus
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
