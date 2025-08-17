import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('DOAGovernanceModule', (m) => {
  const daoGovernance = m.contract('DAOGovernance');

  return { daoGovernance };
});
