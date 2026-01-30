
export interface GithubFile {
  name: string;
  path: string;
  content: string;
  url: string;
}

const RELEVANT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.php', '.yml', '.yaml', '.json'];
const IGNORED_PATHS = ['node_modules', 'dist', 'build', '.git', 'coverage', 'public', 'assets', 'package-lock.json', 'yarn.lock'];

// Prioritize manifest and config files
const PRIORITY_FILES = ['package.json', 'requirements.txt', 'go.mod', 'README.md', 'Dockerfile', '.env.example', 'server.ts', 'app.ts', 'index.js'];

export const parseGithubUrl = (url: string) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace('.git', '') };
};

export const fetchRepoContents = async (owner: string, repo: string, path = '', depth = 0): Promise<string> => {
  if (depth > 2) return ''; // Limit depth to avoid massive recursive fetches

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 403) throw new Error("GitHub API rate limit exceeded. Try again later or paste code manually.");
    throw new Error(`Failed to fetch repository: ${response.statusText}`);
  }

  const items = await response.json();
  let combinedCode = '';
  let filesProcessed = 0;
  const maxFiles = 12;

  // 1. First, grab priority files in current directory
  for (const item of items) {
    if (filesProcessed >= maxFiles) break;
    if (item.type === 'file' && PRIORITY_FILES.includes(item.name)) {
      const fileResponse = await fetch(item.download_url);
      if (fileResponse.ok) {
        const content = await fileResponse.text();
        combinedCode += `\n\n// PRIORITY_FILE: ${item.path}\n${content.slice(0, 10000)}`;
        filesProcessed++;
      }
    }
  }

  // 2. Then, grab other relevant source files
  for (const item of items) {
    if (filesProcessed >= maxFiles) break;
    
    if (item.type === 'dir' && !IGNORED_PATHS.some(p => item.path.includes(p))) {
      // Recurse into common source dirs
      if (['src', 'lib', 'app', 'routes', 'controllers', 'api', 'services'].includes(item.name)) {
        combinedCode += await fetchRepoContents(owner, repo, item.path, depth + 1);
      }
    } else if (item.type === 'file' && !PRIORITY_FILES.includes(item.name) && RELEVANT_EXTENSIONS.some(ext => item.name.endsWith(ext))) {
      const fileResponse = await fetch(item.download_url);
      if (fileResponse.ok) {
        const content = await fileResponse.text();
        combinedCode += `\n\n// FILE: ${item.path}\n${content.slice(0, 5000)}`;
        filesProcessed++;
      }
    }
  }

  return combinedCode;
};
