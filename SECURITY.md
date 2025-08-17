# Security Documentation

## Known Vulnerabilities

### bigint-buffer Vulnerability (GHSA-3gc7-fjrx-p6mg)

**Status**: Known Issue - Transitive Dependency  
**Severity**: High  
**Affected Package**: bigint-buffer <=1.1.5  
**Dependency Path**: @dynamic-labs/ethereum → @dynamic-labs/waas-evm → @dynamic-labs/waas → @dynamic-labs/solana-core → @solana/spl-token → @solana/buffer-layout-utils → bigint-buffer

#### Details
- **Vulnerability**: Buffer Overflow via toBigIntLE() Function
- **CVE**: https://github.com/advisories/GHSA-3gc7-fjrx-p6mg
- **Risk**: High severity buffer overflow vulnerability

#### Current Status
- ✅ **Dependencies Updated**: All direct dependencies are at latest versions
- ⚠️ **Transitive Issue**: Vulnerability is in Dynamic Labs' Solana dependencies
- ✅ **Risk Assessment**: Low risk for this application (not using Solana features)
- 🔄 **Monitoring**: Waiting for Dynamic Labs to update their dependencies

#### Mitigation
1. **No Direct Impact**: This application does not use Solana functionality
2. **Transitive Dependency**: The vulnerability is in Dynamic Labs' dependencies
3. **Acceptable Risk**: Given the use case, this is an acceptable risk
4. **Future Action**: Monitor for Dynamic Labs updates

#### Resolution Plan
- [ ] Monitor Dynamic Labs releases for updates
- [ ] Update when Dynamic Labs fixes the transitive dependency
- [ ] Consider removing Solana dependencies if not needed

## Environment Variables

### Required for Production
- `OPENAI_API_KEY`: Required for AI agent functionality
- `NEXT_PUBLIC_DYNAMIC_ENV_ID`: Required for Dynamic Labs wallet connection

### Security Notes
- Environment variables are properly excluded from git via .gitignore
- No sensitive data is committed to the repository
- API keys are handled securely with conditional initialization

## Build Security
- ✅ TypeScript compilation passes
- ✅ All linting checks pass
- ✅ No direct security vulnerabilities in application code
- ⚠️ One transitive dependency vulnerability (documented above)

Last Updated: $(date)
