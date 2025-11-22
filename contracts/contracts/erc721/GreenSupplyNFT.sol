// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GreenSupplyNFT
 * @dev ERC721 NFT for representing unique supply chain assets
 * Each NFT represents a unique product or asset in the supply chain
 */
contract GreenSupplyNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event NFTBurned(uint256 indexed tokenId);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {}

    /**
     * @dev Mint a new NFT to a specific address
     * @param to Address to receive the NFT
     * @param tokenURI Metadata URI for the NFT
     * @return tokenId The ID of the newly minted NFT
     */
    function mint(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        emit NFTMinted(to, newTokenId, tokenURI);
        return newTokenId;
    }

    /**
     * @dev Burn an NFT
     * @param tokenId ID of the token to burn
     */
    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: caller is not owner nor approved");
        _burn(tokenId);
        emit NFTBurned(tokenId);
    }

    /**
     * @dev Get the current token counter
     * @return Current token ID
     */
    function currentTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev Get total supply of minted NFTs
     * @return Total number of NFTs minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}

