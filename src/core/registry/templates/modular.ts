import type { Policy } from '../../../schema/policy.schema';

export const modularTemplate: Policy = {
  "meta": {
    "version": "1.0.0",
    "output_mode": "compact",
    "generated_at": ""
  },
  "stack": {
    "domain": "frontend",
    "pattern": "modular",
    "state_philosophy": "module-based",
    "styling_strategy": "any",
  },
  "layers": [
    { 
      "id": "modules", 
      "allowed_imports": ["shared"],
      "responsibilities": {
        "owns": ["business logic", "components", "hooks", "services"],
        "must_not": ["import directly from other modules"],
        "depends_on_abstractions": true
      }
    },
    { 
      "id": "shared",  
      "allowed_imports": [],
      "responsibilities": {
        "owns": ["design system", "utils", "global types", "api client"],
        "must_not": ["contain business logic", "import from modules"],
        "depends_on_abstractions": false
      }
    }
  ],
  "import_matrix": {
    "modules": ["shared"],
    "shared":  []
  },
  "structural_constraints": {
    "max_component_depth": 4,
    "barrel_exports_required": true,
    "circular_imports": "FORBIDDEN",
    "cross_feature_imports": "via-public-api-only"
  },
  "ui_constraints": {
    "component_max_lines": 200,
    "component_max_props": 5,
    "prop_drilling_max_depth": 2,
    "logic_in_components": false,
    "style_co_location": true,
    "allowed_style_extensions": [".css", ".module.css"],
    "prefer_composition": true
  },
  "state_constraints": {
    "global_state_scope": "module-based",
    "local_state_allowed": true,
    "derived_state_strategy": "selectors",
    "forbidden_patterns": ["direct-mutation"]
  },
  "side_effect_boundaries": {
    "allowed_in_layers": ["modules", "shared"],
    "forbidden_in_layers": [],
    "async_pattern": "async-await",
    "data_fetching_scope": "modules"
  },
  "naming_conventions": {
    "global_strategy": "PascalCase",
    "component": "PascalCase",
    "hook": "camelCase",
    "store": "camelCase",
    "service": "camelCase",
    "type": "PascalCase",
    "constant": "SCREAMING_SNAKE_CASE"
  },
  "file_conventions": {
    "types": {
      "component": {
        "pattern": "*.tsx",
        "companions": {
          "style": { "required": false, "extensions": [".css", ".module.css"] },
          "test":  { "required": true,  "extensions": [".test.tsx"] }
        }
      },
      "hook": {
        "pattern": "use*.ts",
        "companions": {
          "test": { "required": true, "extensions": [".test.ts", ".spec.ts"] }
        }
      },
      "store": {
        "pattern": "*.store.ts",
        "companions": {
          "test": { "required": true, "extensions": [".test.ts", ".spec.ts"] }
        }
      },
      "service": {
        "pattern": "*.service.ts",
        "companions": {
          "test": { "required": false, "extensions": [".test.ts"] }
        }
      },
      "types": {
        "pattern": "*.types.ts"
      },
      "constants": {
        "pattern": "*.constants.ts"
      }
    },
    "colocation": "strict",
    "public_api": {
      "required": true,
      "expose_internals": false
    },
    "test_placement": "colocated",
    "forbidden_patterns": [
      "default-export-on-utility",
      "barrel-in-non-feature-root"
    ]
  },
  "token_metadata": {
    "estimated_prompt_tokens": 0,
    "compression_applied": false,
    "omitted_sections": []
  }
};
