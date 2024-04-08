import fs from "fs";
import { promisify } from "util";


const unlinkAsync = promisify(fs.unlink);

export const deleteFile = async (filePath: string) => {
  try {
    await unlinkAsync(`.${filePath}`); // Might need adjustment here in production path looks like this currently:  ./public/logos/example.png
  } catch (error) {
    console.error("Error from deleteFile function");
    throw error;
  }
};
