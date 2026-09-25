import { useAuth } from "@clerk/expo";
import { View } from "react-native";
import { styles } from "../../styles/auth.styles";

export default function Index() {
  const { signOut } = useAuth();
  return <View style={styles.container}>{/* HEADER */}</View>;
}
