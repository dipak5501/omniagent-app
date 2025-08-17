# Pre-Commit Checks Guide

This guide ensures your code passes all quality checks before creating a pull request, preventing CI/CD failures.

## 🚀 Quick Start

Before pushing your code, run:

```bash
bun run pre-commit
```

This single command runs all necessary checks and ensures your code is ready for submission.

## 📋 What Gets Checked

The pre-commit process verifies:

### 1. **Code Quality**
- ✅ **Biome Linting**: Code style and best practices
- ✅ **ESLint**: JavaScript/TypeScript linting
- ✅ **Code Formatting**: Consistent code style with Biome

### 2. **Type Safety**
- ✅ **TypeScript Compilation**: Type checking without emitting files
- ✅ **Type Errors**: Catches type mismatches and missing types

### 3. **Build Verification**
- ✅ **Production Build**: Ensures the app builds successfully
- ✅ **Static Generation**: Verifies all pages can be generated
- ✅ **Bundle Analysis**: Checks for build size and optimization

## 🔧 Available Commands

### Quick Commands
```bash
# Run all checks (recommended before PR)
bun run pre-commit

# Alternative: Run comprehensive check
bun run check:all
```

### Individual Checks
```bash
# Linting only
bun run lint:biome
bun run lint

# Formatting only
bun run format:check
bun run format

# Type checking only
bunx tsc --noEmit

# Build only
bun run build
```

### Auto-fix Commands
```bash
# Fix linting issues
bun run lint:biome:fix

# Fix formatting issues
bun run format

# Fix all issues
bun run check:fix
```

## 🛠️ Manual Scripts

### For Unix/Linux/macOS
```bash
# Make script executable
chmod +x scripts/pre-commit.sh

# Run the script
./scripts/pre-commit.sh
```

### For Windows
```cmd
# Run the batch script
scripts\pre-commit.bat
```

## ⚠️ Common Issues & Solutions

### 1. **Biome Linting Errors**
```bash
# Fix automatically
bun run lint:biome:fix

# Or manually fix the issues shown in the output
```

### 2. **Formatting Issues**
```bash
# Fix automatically
bun run format

# Check what needs fixing
bun run format:check
```

### 3. **TypeScript Errors**
```bash
# Check for type errors
bunx tsc --noEmit

# Fix type issues in your code
```

### 4. **Build Failures**
```bash
# Check build errors
bun run build

# Common fixes:
# - Fix import/export issues
# - Resolve type errors
# - Check for missing dependencies
```

## 🔍 CI/CD Integration

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs the same checks:

1. **Biome Formatting Check**
2. **Biome Linting**
3. **ESLint**
4. **TypeScript Type Checking**
5. **Production Build**
6. **Security Audit**

## 📊 Expected Output

When all checks pass, you should see:

```
✅ Biome linting passed
✅ ESLint passed  
✅ Code formatting is correct
✅ TypeScript type checking passed
✅ Build successful
🎉 All checks passed! Your code is ready for push.
```

## 🚨 Important Notes

### Dynamic SDK Warnings
The warnings about Dynamic SDK using a test environment ID are **expected** and don't affect functionality:
```
[DynamicSDK] [WARN]: WARNING: DYNAMIC is using a test environment ID...
```

These warnings are normal in development and won't cause CI/CD failures.

### Performance
- Full check takes ~1-2 minutes
- Build step is the longest (~30-60 seconds)
- Subsequent runs are faster due to caching

## 🎯 Best Practices

1. **Run checks frequently**: Don't wait until the end to run checks
2. **Fix issues immediately**: Address linting/formatting issues as you code
3. **Use your IDE**: Configure your editor to show linting errors in real-time
4. **Commit often**: Small, focused commits are easier to debug
5. **Test locally**: Always run `bun run pre-commit` before pushing

## 🔧 IDE Setup

### VS Code Extensions
- **Biome**: For formatting and linting
- **TypeScript**: For type checking
- **ESLint**: For additional linting

### Auto-format on Save
Add to your VS Code settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome"
}
```

## 📞 Troubleshooting

If you encounter issues:

1. **Clear cache**: `rm -rf .next && bun run build`
2. **Reinstall dependencies**: `rm -rf node_modules && bun install`
3. **Check Node.js version**: Ensure you're using the correct version
4. **Update dependencies**: `bun update`

## 🎉 Success Checklist

Before creating your PR, ensure:

- [ ] `bun run pre-commit` passes without errors
- [ ] No TypeScript compilation errors
- [ ] All linting warnings are addressed
- [ ] Code is properly formatted
- [ ] Build completes successfully
- [ ] All tests pass (if applicable)

Your code is now ready for a successful pull request! 🚀 