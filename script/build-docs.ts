import { build as viteBuild } from "vite";
import { rm, cp, mkdir, readdir, copyFile, stat } from "fs/promises";
import path from "path";

async function copyRecursive(src: string, dest: string) {
  const entries = await readdir(src, { withFileTypes: true });
  await mkdir(dest, { recursive: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function buildForGitHubPages() {
  console.log("Building for GitHub Pages...");
  
  console.log("1. Cleaning dist and docs folders...");
  await rm("dist", { recursive: true, force: true });
  await rm("docs", { recursive: true, force: true });
  
  console.log("2. Building client with Vite...");
  await viteBuild();
  
  console.log("3. Copying dist/public to docs...");
  await copyRecursive("dist/public", "docs");
  
  console.log("Build complete! The docs folder is ready for GitHub Pages.");
  console.log("\nGitHub Pages setup:");
  console.log("1. Push the docs folder to your repository");
  console.log("2. Go to Settings > Pages");
  console.log("3. Set Source to 'Deploy from a branch'");
  console.log("4. Select your branch and '/docs' folder");
}

buildForGitHubPages().catch((err) => {
  console.error(err);
  process.exit(1);
});
