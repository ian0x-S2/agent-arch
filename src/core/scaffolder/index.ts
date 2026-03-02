import fs from 'fs-extra';
import path from 'path';
import type { Policy } from '../../schema/policy.schema';

export const scaffoldStructure = async (policy: Policy, baseDir: string = 'src') => {
  const { pattern } = policy.stack;
  const { layers, fsd_config } = policy;
  const segments = fsd_config?.segments ?? ['ui', 'model', 'api', 'lib', 'config'];

  console.log(`Scaffolding structure for pattern: ${pattern} in ./${baseDir}...`);

  for (const layer of layers) {
    const layerPath = path.join(baseDir, layer.id);
    await fs.ensureDir(layerPath);
    console.log(`  ✓ Created layer: ${layer.id}`);

    // If FSD, we might want to create a placeholder slice
    if (pattern === 'feature-sliced' && layer.id !== 'shared' && layer.id !== 'app') {
      const placeholderSlice = path.join(layerPath, 'placeholder');
      await fs.ensureDir(placeholderSlice);
      
      for (const segment of segments) {
        await fs.ensureDir(path.join(placeholderSlice, segment));
      }

      if (policy.file_conventions.public_api.required) {
        await fs.writeFile(path.join(placeholderSlice, 'index.ts'), '// Public API\n');
      }
      console.log(`    ✓ Created placeholder slice in ${layer.id}`);
    }

    // Create index.ts for the layer if required
    if (policy.file_conventions.public_api.required && !['app', 'pages'].includes(layer.id)) {
      const indexPath = path.join(layerPath, 'index.ts');
      if (!(await fs.pathExists(indexPath))) {
        await fs.writeFile(indexPath, `// Public API for ${layer.id}
`);
      }
    }
  }

  console.log('Scaffolding complete!');
};
