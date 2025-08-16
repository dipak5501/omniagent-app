import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('DAOActionExecutorModule', (m) => {
  const daoActionExecutor = m.contract('DAOActionExecutor');

  return { daoActionExecutor };
});
