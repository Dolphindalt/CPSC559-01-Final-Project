export class MarketItem {
    public itemId: string | undefined;
    public nftContract: string | undefined;
    public tokenId: string | undefined;
    public seller: string = "";
    public owner: string | undefined;
    public price: string | undefined;
    public sold: boolean | undefined;
}