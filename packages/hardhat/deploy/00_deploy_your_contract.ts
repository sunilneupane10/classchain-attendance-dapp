import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployAttendanceRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("AttendanceRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default deployAttendanceRegistry;
deployAttendanceRegistry.tags = ["AttendanceRegistry"];
