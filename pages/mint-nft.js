// import WarriorNftAddresses from "../constants/WarriorNftAddresses.json" // UNMUTE_FOR_WARRIOR_NFT
import WarriorNftAddresses from "../constants/CupheadNftAddresses.json" // MUTE_FOR_WARRIOR_NFT
// import WarriorNft from "../constants/WarriorNft.json" // UNMUTE_FOR_WARRIOR_NFT
import WarriorNft from "../constants/CupheadNft.json" // MUTE_FOR_WARRIOR_NFT
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()

    const MINT_FEE = ethers.utils.parseEther("0.01").toString();
    const chainId = parseInt(chainIdHex)

    const WarriorNftAddress = chainId in WarriorNftAddresses ? WarriorNftAddresses[chainId][0] : null

    const dispatch = useNotification()

    const {
        runContractFunction: mintNft,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: WarriorNft,
        contractAddress: WarriorNftAddress,
        functionName: "mintNft",
        // msgValue: MINT_FEE,   // UNMUTE_FOR_WARRIOR_NFT
        params: {},
    })

    async function updateUIValues() {
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-2xl">Mint your Bragon Egg!</h1>
            {WarriorNftAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () =>
                            await mintNft({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Mint NFT"
                        )}
                    </button>
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}
