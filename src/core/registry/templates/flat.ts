import type { Policy } from '../../../schema/policy.schema';

export const flatTemplate: Policy = {
  "meta": {
    "version": "1.0.0",
    "enforcement": "moderate",
    "output_mode": "balanced",
    "generated_at": ""
  },
  "stack": {
    "domain": "frontend",
    "pattern": "flat",
    "state_philosophy": "flexible",
    "styling_strategy": "any",
    "routing_strategy": "any"
  },
  "layers": [
    { "id": "src", "allowed_imports": ["src"] }
  ],
  "import_matrix": {
    "src": ["src"]
  },
  "structural_constraints": {
    "max_component_depth": 3,
    "barrel_exports_required": false,
    "circular_imports": "FORBIDDEN",
    "cross_feature_imports": "allowed"
  },
  "ui_constraints": {
    "component_max_lines": 300,
    "component_max_props": 8,
    "prop_drilling_max_depth": 3,
    "logic_in_components": true,
    "style_co_location": false,
    "allowed_style_extensions": [".css", ".scss", ".sass", ".less"],
    "prefer_composition": false
  },
  "state_constraints": {
    "global_state_scope": "any",
    "local_state_allowed": true,
    "derived_state_strategy": "any",
    "forbidden_patterns": []
  },
  "side_effect_boundaries": {
    "allowed_in_layers": ["src"],
    "forbidden_in_layers": [],
    "async_pattern": "any",
    "data_fetching_scope": "any"
  },
  "naming_conventions": {
    "global_strategy": "camelCase",
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
          "test": { "required": false, "extensions": [".test.tsx", ".spec.tsx"] }
        }
      },
      "hook": {
        "pattern": "*.ts",
        "companions": null
      },
      "utils": {
        "pattern": "*.ts",
        "companions": null
      }
    },
    "colocation": "none",
    "public_api": {
      "required": false,
      "expose_internals": true
    },
    "test_placement": "colocated",
    "forbidden_patterns": []
  },
  "token_metadata": {
    "estimated_prompt_tokens": 0,
    "compression_applied": false,
    "omitted_sections": []
  }
};
