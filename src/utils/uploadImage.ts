import { File, UploadType } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Id } from "../../convex/_generated/dataModel";

// wide enough for any phone screen; camera photos are often 4000px+
const MAX_IMAGE_WIDTH = 1080;

// shrink a local image to MAX_IMAGE_WIDTH (never upscale) and re-encode as JPEG
async function prepareImage(uri: string) {
  const image = await ImageManipulator.manipulate(uri).renderAsync();
  const resized =
    image.width > MAX_IMAGE_WIDTH
      ? await ImageManipulator.manipulate(image)
          .resize({ width: MAX_IMAGE_WIDTH, height: null })
          .renderAsync()
      : image;

  const saved = await resized.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.8,
  });
  return saved.uri;
}

// upload a local image to a Convex upload URL and return its storage id
export async function uploadImage(
  uri: string,
  uploadUrl: string,
): Promise<Id<"_storage">> {
  const preparedUri = await prepareImage(uri);

  const uploadResult = await new File(preparedUri).upload(uploadUrl, {
    httpMethod: "POST",
    uploadType: UploadType.BINARY_CONTENT,
    mimeType: "image/jpeg",
  });
  if (uploadResult.status !== 200) throw new Error("Upload failed");

  const { storageId } = JSON.parse(uploadResult.body);
  return storageId;
}
