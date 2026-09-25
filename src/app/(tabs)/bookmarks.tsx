import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { FlatList, Text, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { styles } from "../../styles/feed.styles";

export default function Bookmarks() {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);

  if (bookmarkedPosts === undefined) return <Loader />;

  if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      {/* POSTS GRID */}
      <FlatList
        data={bookmarkedPosts}
        numColumns={3}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 8, paddingBottom: 60 }}
        renderItem={({ item }) => (
          <View style={{ width: "33.33%", padding: 1 }}>
            <Image
              source={item.imageUrl}
              style={{ width: "100%", aspectRatio: 1 }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>
        )}
      />
    </View>
  );
}

const NoBookmarksFound = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={{ fontSize: 22, color: COLORS.primary }}>
      No bookmarked posts yet
    </Text>
  </View>
);
