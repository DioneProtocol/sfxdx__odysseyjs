import { GetStakeParams } from "../../src/apis/omegavm"

const main = async (): Promise<any> => {
  const getStakeParams: GetStakeParams = {
    addresses: ["O-local18jma8ppw3nhx5r4ap8clazz0dps7rv5u00z96u"],
    encoding: "cb58"
  }
  console.log(getStakeParams)
}

main()
