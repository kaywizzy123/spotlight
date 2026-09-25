import { File, UploadType } from "expo-file-system";
import { Id } from "../../convex/_generated/dataModel";

// upload a local image to a Convex upload URL and return its storage id
export async function uploadImage(
  uri: string,
  uploadUrl: string,
): Promise<Id<"_storage">> {
  const uploadResult = await new File(uri).upload(uploadUrl, {
    httpMethod: "POST",
    uploadType: UploadType.BINARY_CONTENT,
    mimeType: "image/jpeg",
  });
  if (uploadResult.status !== 200) throw new Error("Upload failed");

  const { storageId } = JSON.parse(uploadResult.body);
  return storageId;
}
