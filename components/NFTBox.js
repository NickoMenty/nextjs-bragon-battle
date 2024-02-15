import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftBattleArenaAbi from "../constants/NFTBattleArena.json"
// import nftAbi from "../constants/WarriorNft.json" // UNMUTE_FOR_WARRIOR_NFT
import nftAbi from "../constants/CupheadNft.json" // MUTE_FOR_WARRIOR_NFT
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import AttackAnNftModal from "./AttackAnNftModal"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

export default function NFTBox({ /*price,*/ nftAddress, tokenId, marketplaceAddress, owner }) {
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [speed, setSpeed] = useState("")
    const [damage, setDamage] = useState("")
    const [intelligence, setIntelligence] = useState("")
    const [nftHP, setHp] = useState("")
    const [winStreak, setWinStreak] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)
    const dispatch = useNotification()

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: "0x8FfB4B311AdC8F1f5c668e1346CA70B374407508",
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    })

    const { runContractFunction: getAttributes } = useWeb3Contract({
        abi: nftBattleArenaAbi,
        contractAddress: marketplaceAddress,
        functionName: "getAttributes",
        params: {
            _tokenId: tokenId,
        },
    })

    const { runContractFunction: getNFTWins } = useWeb3Contract({
        abi: nftBattleArenaAbi,
        contractAddress: marketplaceAddress,
        functionName: "getNFTWins",
        params: {
            _tokenId: tokenId,
        },
    })

    const { runContractFunction: unlistNFTFromBattle } = useWeb3Contract({
        abi: nftBattleArenaAbi,
        contractAddress: marketplaceAddress,
        functionName: "unlistNFTFromBattle",
        params: {
            tokenId: tokenId,
        },
    })

    async function updateUI() {
        const tokenURI = await getTokenURI()
        const attributes = await getAttributes()
        const winstreak = await getNFTWins()
        console.log(`The TokenURI is ${tokenURI}`)
        // We are going to cheat a little here...
        if (tokenURI) {
            // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(requestURL)).json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setSpeed(attributes[0].toString())
            setDamage(attributes[1].toString())
            setIntelligence(attributes[2].toString())
            setHp(attributes[3].toString())
            setWinStreak(winstreak.toString())
            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
            // We could render the Image on our sever, and just call our sever.
            // For testnets & mainnet -> use moralis server hooks
            // Have the world adopt IPFS
            // Build our own IPFS gateway
        }
        // get the tokenURI
        // using the image tag from the tokenURI, get the image
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwnedByUser = owner === account || owner === undefined
    const formattedOwnerAddress = isOwnedByUser ? "you" : truncateStr(owner || "", 15)

    const handleCardClick = () => {
        if (!isOwnedByUser) {
            setShowModal(true);
        } else {
            unlistNFTFromBattle({
                onError: (error) => console.log(error),
                onSuccess: () => handleunlistNFTFromBattleSuccess(),
            });
        }
    }

    const handleunlistNFTFromBattleSuccess = () => {
        dispatch({
            type: "success",
            message: "Item Unlisted",
            title: "Item Unlisted",
            position: "topR",
        })
    }
    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <AttackAnNftModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm" style={{ color: 'blue' }}>Speed: {speed}</div>
                                    <div className="italic text-sm" style={{ color: 'blue' }}>Damage: {damage}</div>
                                    <div className="italic text-sm" style={{ color: 'blue' }}>Intelligence: {intelligence}</div>
                                    <div className="italic text-sm" style={{ color: 'red' }}>HP: {nftHP}</div>
                                    <div className="italic text-sm" style={{ color: 'gold' }}>WinStreak: {winStreak}</div>
                                    <div className="italic text-sm">
                                        Owned by {formattedOwnerAddress}
                                    </div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                    <div className="font-bold">
                                        
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading an NFT...</div>
                )}
            </div>
        </div>
    )
}
