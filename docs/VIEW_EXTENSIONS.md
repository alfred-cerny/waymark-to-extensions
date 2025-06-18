# WaymarkTo View Extensions Guide

This guide explains how to use the view extension system in the WaymarkTo extension for EspoCRM.

## Overview

The view extension system allows you to extend or override existing EspoCRM views without modifying the original files. This is achieved through a custom AMD loader that supports an `extend()` function.

## Configuration

View extensions are configured in `custom/Espo/Modules/WaymarkTo/Resources/metadata/app/client.json`:

```json
{
    "viewExtensions": {
        "views/record/detail": ["waymark-to:views/record/detail-extended"],
        "views/record/list": ["waymark-to:views/record/list-enhanced", "waymark-to:views/record/list-final"],
        "views/fields/varchar": ["waymark-to:views/fields/varchar-custom"]
    }
}
```

### Configuration Format

- **Key**: The original view path (e.g., `views/record/detail`)
- **Value**: Array of extension view paths in order of application

Extensions are applied sequentially, with each extension building upon the previous one.

## Creating View Extensions

### Using the `extend()` Function

Create extension files using the global `extend()` function:

```javascript
// File: client/modules/waymark-to/src/views/record/detail-extended.js
extend(Dep => {
    return class extends Dep {
        setup() {
            super.setup();
            console.log('Extended detail view setup');
            // Add your custom logic here
        }

        afterRender() {
            super.afterRender();
            // Add custom rendering logic
        }

        // Add new methods
        customMethod() {
            // Your custom functionality
        }
    };
});
```

### Multiple Extensions Example

When multiple extensions are defined for a view:

```json
{
    "viewExtensions": {
        "views/record/list": [
            "waymark-to:views/record/list-base",
            "waymark-to:views/record/list-enhanced"
        ]
    }
}
```

The extension chain works as follows:
1. Original `views/record/list` is loaded
2. `waymark-to:views/record/list-base` extends the original
3. `waymark-to:views/record/list-enhanced` extends the base extension

## Practical Examples

### Example 1: Adding Custom Buttons to Detail View

```javascript
// client/modules/waymark-to/src/views/record/detail-with-buttons.js
extend(Dep => {
    return class extends Dep {
        setup() {
            super.setup();
            
            this.menu.buttons.push({
                name: 'customAction',
                label: 'Custom Action',
                style: 'primary',
                action: 'customAction'
            });
        }

        actionCustomAction() {
            console.log('Custom action triggered');
            // Implement your custom action
        }
    };
});
```

### Example 2: Modifying Field Behavior

```javascript
// client/modules/waymark-to/src/views/fields/varchar-uppercase.js
extend(Dep => {
    return class extends Dep {
        fetch() {
            const data = super.fetch();
            if (data[this.name]) {
                data[this.name] = data[this.name].toUpperCase();
            }
            return data;
        }
    };
});
```

### Example 3: Adding Lifecycle Hooks

```javascript
// client/modules/waymark-to/src/views/record/list-with-hooks.js
extend(Dep => {
    return class extends Dep {
        setup() {
            super.setup();
            
            this.on('after:render', () => {
                console.log('List view rendered');
            });
            
            this.on('remove', () => {
                console.log('List view being removed');
            });
        }
    };
});
```

## Best Practices

1. **Always call parent methods**: Use `super.methodName()` to maintain original functionality
2. **Namespace your extensions**: Use descriptive names like `waymark-to:views/record/detail-with-custom-buttons`
3. **Keep extensions focused**: Each extension should have a single responsibility
4. **Document your extensions**: Add comments explaining what each extension does
5. **Test incrementally**: Test each extension individually before chaining multiple extensions

## How It Works

The extender.js loader:
1. Intercepts module loading requests
2. Checks if the requested module has extensions defined
3. Loads the extension chain in order
4. Each extension receives the previous implementation as its dependency
5. Returns the final extended class

This allows for non-invasive customization of any view in the system.

## Troubleshooting

### Extension not being applied
- Check that the view path in `viewExtensions` matches exactly
- Verify the extension file exists at the specified path
- Check browser console for loading errors

### Multiple extensions conflict
- Review the order of extensions in the configuration
- Ensure each extension properly calls parent methods
- Check for naming conflicts in added properties/methods

### Performance considerations
- The extension system adds minimal overhead
- Extensions are loaded and cached like regular modules
- Avoid creating too many small extensions - combine related functionality