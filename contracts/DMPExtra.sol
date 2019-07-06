pragma solidity ^0.5;

//npm install -E openzeppelin-solidity
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract DMPExtra is Ownable {       // Using ownable library.

    using SafeMath for uint;            // Using safe math library.
    uint public creationTime = now;     // Time of deployment.

    constructor() public
    {
    }

    modifier ownerRestricted {
        require(owner() == msg.sender, "owner restricted feature");
        _;
        // "_;" is replaced by the function body where the modifier is used.
    }

    function destroyContract() external ownerRestricted {
        // Destroy is limited to owner.
        // If there is any other value left in contract
        // return it to the contract owner (which will be the sender)
        selfdestruct(msg.sender);
    }
    // mappings for ownership of user, store, product, store product and order.
    mapping(uint => uint[]) public StoreProductMap;
    mapping(address => uint[]) public OrderOwnerMap;

    /*
     * the following storage areas are likely stored mostly off chain
     * and only the financial transaction stored in the ledger
     */
    storeproduct[] public storeproducts;    /* data storage area for products in a store */
    order[] public orders;                  /* data storage area for product purchase from a store */

    // list events and information within them
    event orderCreated (uint oid, uint uid, uint sid, uint pid, uint256 price, uint256 qty, uint timestamp);
    event storeproductCreated(uint spid, uint sid, uint pid, uint256 price, uint256 qty_avail, uint timestamp);
    event storeproductUpdated(uint spid, uint sid, uint pid, uint256 price, uint256 qty_avail, uint status, uint timestamp);
    event storeproductDecreased(uint spid, uint256 qty_avail, uint timestamp);

    // structure for store product (a product within a store)
    struct storeproduct
    {
        uint spid;
        uint sid;
        uint pid;
        uint256 price;
        uint256 qty_avail;
        productStatus status;
    }
    enum productStatus { Available, BackOrder}

    // structure for order (a purchase of a product from a store)
    struct order
    {
        uint oid;
        uint sid;
        uint spid;
        uint pid;
        uint256 price;
        uint256 qty;
    }

    /*
     * The following are the main functional calls that the web (client) front-end uses.
     */

    function createStoreProductExtra( uint _sid, uint _pid, uint256 _price, uint256 _qty_avail, uint8 _status) public returns (uint id)
    {
        id = storeproducts.length++;
        storeproduct storage newStoreProduct = storeproducts[id];
        newStoreProduct.sid = _sid;
        newStoreProduct.pid = _pid;
        newStoreProduct.spid = id;
        newStoreProduct.price = _price;
        newStoreProduct.qty_avail = _qty_avail;
        newStoreProduct.status = productStatus(_status);
        StoreProductMap[_sid].push(id);
        emit storeproductCreated(id, newStoreProduct.sid, newStoreProduct.pid, newStoreProduct.price, newStoreProduct.qty_avail, now);
        return id;
    }

    function getStoreProductCountExtra() public view returns (uint)
    {
        return storeproducts.length;
    }

   function getStoreProductIdForStoreExtra(uint _sid, uint idx) public view returns (uint)
    {
        if (getStoreProductCountForStoreExtra(_sid) >= idx)
        {
            return StoreProductMap[_sid][idx];
        }
        else
        {
            revert("store product index does not exist for this store!");
        }
    }

    // get the Store Product for the store and index position
    function getStoreProductForStoreExtra(uint _sid, uint _idx) public view returns ( uint, uint, uint, uint256, uint256, uint)
    {
        if (getStoreProductCountForStoreExtra(_sid) >= _idx)
        {
            return getStoreProductExtra(StoreProductMap[_sid][_idx]);
        }
        else
        {
            revert("store product index does not exist for this store!");
        }
    }

    function getStoreProductExtra(uint idx) public view returns ( uint, uint, uint, uint256, uint256, uint8)
    {
        storeproduct memory temp = storeproducts[idx];
        return (temp.spid, temp.sid, temp.pid, temp.price, temp.qty_avail, uint8(temp.status));
    }

    function getStoreProductCountForStoreExtra(uint _sid) public view returns (uint)
    {
        return StoreProductMap[_sid].length;
    }

    function createOrderExtra( address _owner, uint _sid, uint _spid, uint _pid, uint256 _price, uint256 _qty) public returns (uint id)
    {
        id = orders.length++;
        order storage newOrder = orders[id];
        newOrder.sid = _sid;
        newOrder.spid = _spid;
        newOrder.pid = _pid;
        newOrder.oid = id;
        newOrder.price = _price;
        newOrder.qty = _qty;
        OrderOwnerMap[_owner].push(id);
        emit orderCreated(id, newOrder.sid, newOrder.spid, newOrder.pid, newOrder.price, newOrder.qty, now);
        return id;
    }

    function getOrderExtra(uint idx) public view returns ( uint, uint, uint, uint, uint256, uint256)
    {
        order memory temp = orders[idx];
        return (temp.oid, temp.sid, temp.spid, temp.pid, temp.price, temp.qty);
    }

    function getOrderCountExtra() public view returns (uint)
    {
        return orders.length;
    }

    /*
     * Update Functions
     */

   function updateStoreProductExtra( uint _spid, uint _sid, uint _pid, uint256 _price, uint256 _qty_avail, uint8 _status)
        public returns (bool success)
    {
        /* Only allow changes to price, qty_avail, and status */
        require(storeproducts[_spid].sid == _sid, "store id mismatch during updateStoreProduct()");
        require(storeproducts[_spid].pid == _pid, "product id mismatch during updateStoreProduct()");
        storeproducts[_spid].price = _price;
        storeproducts[_spid].qty_avail = _qty_avail;
        storeproducts[_spid].status = productStatus(_status);
        emit storeproductUpdated(_spid, _sid, _pid, _price, _qty_avail, (uint8)(_status), now);
        return true;
    }

    function decrementQtyAvailExtra( uint _spid)
    public returns (uint256 qty_avail)
    {
        storeproducts[_spid].qty_avail -= 1;
        emit storeproductDecreased(_spid, storeproducts[_spid].qty_avail, now);
        return storeproducts[_spid].qty_avail;
    }

    function validateSellProductExtra( uint sid, uint spid)
    public returns (bool ok)
    {
        // ensure store product id is within array boundary
        require(spid >= 0 && spid <= storeproducts.length, "store product id does not exist");
        // get store product (not necessary access directly in array)
        // storeproduct memory temp = storeproducts[_spid];
        // (uint a, uint b, uint c, uint256 d, uint256 e, uint8 f) = dmpExtraContract.getStoreProductExtra(_spid);
        // storeproduct memory temp = storeproduct(a,b,c,d,e,productStatus(f));
        // ensure store id matches
        require (storeproducts[spid].sid == sid, "store id does not match");
        // ensure at least 1 available
        require (storeproducts[spid].qty_avail > 0, "insufficient inventory of store product");
        decrementQtyAvailExtra(spid);
        return true;
    }
}