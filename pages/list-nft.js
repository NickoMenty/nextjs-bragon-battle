import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { Form, useNotification, Button } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import WarriorNftAddresses from "../constants/CupheadNftAddresses.json" // MUTE_FOR_WARRIOR_NFT
// import WarriorNftAddresses from "../constants/WarriorNftAddresses.json" // UNMUTE_FOR_WARRIOR_NFT
import { ethers } from "ethers"
import nftAbi from "../constants/CupheadNft.json" // MUTE_FOR_WARRIOR_NFT
// import nftAbi from "../constants/WarriorNft.json" // UNMUTE_FOR_WARRIOR_NFT
import nftBattleArenaAbi from "../constants/NFTBattleArena.json"
import networkMapping from "../constants/networkMapping.json"
import { useEffect, useState } from "react"

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = "0x667E3123Cfd7eBD371Addf9454396dD1Db624ed1" // networkMapping[chainString].NFTBattleArena[0]
    const dispatch = useNotification()
    const [proceeds, setProceeds] = useState("0")

    const { runContractFunction } = useWeb3Contract()

    const WarriorNftAddress = chainId in WarriorNftAddresses ? WarriorNftAddresses[chainId][0] : null

    async function approveAndList(data) {
        console.log("Approving...")
        const nftAddress = WarriorNftAddresses[chainString][0]
        const tokenId = data.data[0].inputResult
        // const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: (tx) => handleApproveSuccess(tx, nftAddress, tokenId),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleApproveSuccess(tx, nftAddress, tokenId) {
        console.log("Ok! Now time to list")
        await tx.wait()
        const listOptions = {
            abi: nftBattleArenaAbi,
            contractAddress: marketplaceAddress,
            functionName: "listNFTForBattle",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: () => handleListSuccess(),
            onError: (error) => console.log(error),
        })
    }

    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topR",
        })
    }

    const handleWithdrawSuccess = () => {
        dispatch({
            type: "success",
            message: "Withdrawing proceeds",
            position: "topR",
        })
    }

    async function setupUI() {
        const returnedProceeds = await runContractFunction({
            params: {
                abi: nftBattleArenaAbi,
                contractAddress: marketplaceAddress,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
            },
            onError: (error) => console.log(error),
        })
        if (returnedProceeds) {
            setProceeds(returnedProceeds.toString())
        }
    }

    useEffect(() => {
        setupUI()
    }, [proceeds, account, isWeb3Enabled, chainId])

    return (
        <div className={styles.container}>
            <div class="">There will be two transactions, please don't reload the page!</div>
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "Token ID",
                        type: "number",
                        value: "",
                        key: "tokenId",
                    },
                ]}
                title="List your NFT for battle"
                id="Main Form"
            />
        </div>
    )
}
