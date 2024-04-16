import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

const writeFileAsync = promisify(fs.writeFile);

export const deleteImage = async (filePath: string) => {
  try {
    await unlinkAsync(`.${filePath}`); // Might need adjustment here in production path looks like this currently:  ./public/logos/example.png
  } catch (error) {
    console.error("Error from deleteFile function");
    throw error;
  }
};



export const uploadImage = async (
  uploadPath: string,
  fileName: string,
  file: Buffer
) => {
  try {
    await writeFileAsync(`.${uploadPath}/${fileName}`, file);
  } catch (error) {
    console.error("Error from uploadImage function");
    throw error;
  }
};


