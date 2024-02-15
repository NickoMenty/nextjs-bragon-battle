import { Modal, Input, useNotification } from "web3uikit"
import { useState } from "react"
import { useWeb3Contract } from "react-moralis"
import nftBattleArenaAbi from "../constants/NFTBattleArena.json"
import { ethers } from "ethers"

export default function AttackAnNftModal({
    nftAddress,
    tokenId,
    isVisible,
    marketplaceAddress,
    onClose,
}) {
    const dispatch = useNotification()

    const [tokenIdToAttack, setTokenIdToAttack] = useState(0)

    const handleAttackAnNftSuccess = () => {
        dispatch({
            type: "success",
            message: "Item is Attacked",
            title: "Item was Attacked - please refresh",
            position: "topR",
        })
        onClose && onClose()
        setTokenIdToAttack("0")
    }

    const { runContractFunction: startBattle } = useWeb3Contract({
        abi: nftBattleArenaAbi,
        contractAddress: marketplaceAddress,
        functionName: "startBattle",
        params: {
            _tokenIdDef: tokenId,
            _tokenIdAtk: tokenIdToAttack,
        },
    })

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={async () => {
                await startBattle({
                    onError: (error) => {
                        console.log(error)
                    },
                    onSuccess: () => handleAttackAnNftSuccess(),
                })
            }}
        >
            <Input
                label="Choose your NFT to attack"
                name="New attack begins"
                type="number"
                onChange={(event) => {
                    setTokenIdToAttack(event.target.value)
                }}
            />
        </Modal>
    )
}
