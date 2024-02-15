import { gql } from "@apollo/client"

const GET_ACTIVE_ITEMS = gql`
    {
        activeItems( where: { burnaddress: "0x0000000000000000000000000000000000000000" }) {
            id
            owner
            burnaddress
            tokenId
        }
    }
`
export default GET_ACTIVE_ITEMS
