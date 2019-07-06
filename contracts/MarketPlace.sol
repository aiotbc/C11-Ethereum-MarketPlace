pragma solidity ^0.5;

//npm install -E openzeppelin-solidity
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/*
 * This MarketPlace is managed by administrators [user type = Admin (0)].
 * Store owners can register and then manage their stores, products, store inventory and funds.
 * Shoppers can visit stores and purchase items that are available using cryptocurrency wallet
 */

// a limited definition of the contract we wish to access
contract DMPExtraInterface {
    function createOrderExtra( address _owner, uint _sid, uint _spid, uint _pid, uint256 _price, uint256 _qty)
    public returns (uint id) {/* intentional empty block */}
    function getOrderExtra(uint idx)
    public view returns ( uint, uint, uint, uint, uint256, uint256) {/* intentional empty block */}
    function getOrderCountExtra()
    public view returns (uint) {/* intentional empty block */}
    function createStoreProductExtra( uint _sid, uint _pid, uint256 _price, uint256 _qty_avail, uint8 _status)
    public returns (uint id) {/* intentional empty block */}
    function updateStoreProductExtra( uint _spid, uint _sid, uint _pid, uint256 _price, uint256 _qty_avail, uint8 _status)
    public returns (bool success) {/* intentional empty block */}
    function validateSellProductExtra( uint sid, uint spid)
    public returns (bool ok) {/* intentional empty block */}
    function getStoreProductCountExtra()
    public view returns (uint) {/* intentional empty block */}
    function getStoreProductIdForStoreExtra(uint _sid, uint _idx)
    public view returns (uint) {/* intentional empty block */}
    function getStoreProductForStoreExtra(uint _sid, uint _idx)
    public view returns ( uint, uint, uint, uint256, uint256, uint) {/* intentional empty block */}
    function getStoreProductExtra(uint idx)
    public view returns ( uint, uint, uint, uint256, uint256, uint8) {/* intentional empty block */}
    function getStoreProductCountForStoreExtra(uint _sid)
    public view returns (uint) {/* intentional empty block */}
}

contract MarketPlace is Ownable {       // Using ownable library.

    using SafeMath for uint;            // Using safe math library.
    uint public creationTime = now;     // Time of deployment.

    // notice that the type here is the contract definition itself
    DMPExtraInterface private dmpExtraContract;

    constructor(address _dmpExtraAddress) public
    {
        // make sure that the address isn't empty
        require(_dmpExtraAddress != address(0), "address is empty or invalid!");
        // set the contract that we want to access by using the definition at the
        // at the top and use the address provided
        dmpExtraContract = DMPExtraInterface(_dmpExtraAddress);

        // Create initial administrator account at deployment.
        createUser("Admin", 0, 0);
    }

    modifier ownerRestricted {
        require(owner() == msg.sender, "owner restricted feature");
        _; // "_;" is replaced by the function body where the modifier is used.
    }

    function destroyContract() external ownerRestricted {
        // Destroy is limited to owner.
        // This point in the contract, loop through the stores and
        // return any funds to the wallet of the store owner.

        // TODO: loop through stores array

        // Finally if there is any other value left in contract
        // return it to the contract owner (which will be the sender)
        selfdestruct(msg.sender);
    }

    mapping (address => uint) private balances;       /* reference to balance in owner wallet */

    // mappings for ownership of user, store, and product.
    mapping(address => uint[]) public UserOwnerMap;
    mapping(address => uint[]) public StoreOwnerMap;
    mapping(address => uint[]) public ProductOwnerMap;

    /*
     * the following storage areas are likely stored mostly off chain
     * and only the financial transaction stored in the ledger
     */
    user[] public users;                    /* data storage area for users */
    store[] public stores;                  /* data storage area for stores */
    product[] public products;              /* data storage area for products */

    // list events and information within them
    // event orderCreated (uint oid, uint uid, uint sid, uint pid, uint256 price, uint256 qty, uint timestamp);
    event productCreated(uint pid, address owner, string name, string description, string imgsrc, uint timestamp);
    event productUpdated(uint pid, string name, string description, string imgsrc, uint timestamp);
    event storeCreated(uint sid, address owner, string name, string description, uint256 amount, string imgsrc, uint timestamp);
    event storeUpdated(uint sid, string name, string description, string imgsrc, uint timestamp);
    event userCreated(uint uid, address user, string username, uint8 usertype, uint8 userstatus, uint timestamp);
    event userUpdated(uint uid, string username, uint8 usertype, uint8 userstatus, uint timestamp);

    // event LogDepositMade(address indexed accountAddress, uint amount);
    // event debug(string text, uint value);

    // structure for user
    struct user
    {
        uint uid;
        address user;
        string username;
        userType usertype;
        userStatus userstatus;
    }
    enum userType {Admin, Owner}
    enum userStatus {Enabled, Disabled}

    // structure for store
    struct store
    {
        uint sid;
        address owner;
        string name;
        string description;
        uint256 amount;
        string imgsrc;
    }

    // structure for product
    struct product
    {
        uint pid;
        address owner;
        string name;
        string description;
        string imgsrc;
    }

    /*
     * The following are the main functional calls that the web (client) front-end uses.
     */

    /*
     * Create Functions
     */

    function createUser(string memory _username, uint8 _usertype, uint8 _userstatus) public payable returns (uint id)
    {
        if (UserOwnerMap[msg.sender].length > 0)
        {
            revert("This address is already a registered user.");
        }
        else
        {
            id = users.length++;
            user storage newUser = users[id];
            newUser.user = msg.sender;
            newUser.usertype = userType(_usertype);
            newUser.username = _username;
            newUser.uid = id;
            balances[msg.sender] = msg.value;

            newUser.userstatus = userStatus(_userstatus);
            UserOwnerMap[newUser.user].push(id);
            emit userCreated(id, newUser.user, newUser.username, (uint8)(newUser.usertype), (uint8)(newUser.userstatus), now);
            return id;
        }
    }

    function register(string memory _username) public returns (uint)
    {
        return createUser(_username, 1, 0);
    }

    // @notice Enroll a customer with the bank, giving the first 3 of them 1 ether for free
    // @return The balance of the user after enrolling
    // function enroll() public returns (uint) {
    //     if (clientCount < 3) {
    //         clientCount++;
    //         balances[msg.sender] = 1 ether;
    //     }
    //     return balances[msg.sender];
    // }

    function createStore( string memory _name, string memory _description,
     string memory _imgsrc ) public payable returns (uint id)
    {
        id = stores.length++;
        store storage newStore = stores[id];
        newStore.owner = msg.sender;
        newStore.sid = id;
        newStore.name = _name;
        newStore.description = _description;
        newStore.amount = msg.value;
        newStore.imgsrc = _imgsrc;
        StoreOwnerMap[newStore.owner].push(id);
        balances[msg.sender] += msg.value;
        emit storeCreated(id, newStore.owner, newStore.name, newStore.description, newStore.amount, newStore.imgsrc, now);
        return id;
    }

    function createProduct( string memory _name, string memory _description, string memory _imgsrc ) public returns (uint id)
    {
        id = products.length++;
        product storage newProduct = products[id];
        newProduct.pid = id;
        newProduct.owner = msg.sender;
        newProduct.name = _name;
        newProduct.description = _description;
        newProduct.imgsrc = _imgsrc;
        ProductOwnerMap[newProduct.owner].push(id);
        emit productCreated(id, newProduct.owner, newProduct.name, newProduct.description, newProduct.imgsrc, now);
        return id;
    }

    function createStoreProduct( uint _sid, uint _pid, uint256 _price, uint256 _qty_avail, uint8 _status) public returns (uint id)
    {
        return dmpExtraContract.createStoreProductExtra(_sid, _pid, _price, _qty_avail, _status);
    }

    function createOrder( address _owner, uint _sid, uint _spid, uint _pid, uint256 _price, uint256 _qty) public returns (uint)
    {
        return dmpExtraContract.createOrderExtra(_owner, _sid, _spid, _pid, _price, _qty);
    }

    /*
     * Get Functions
     */

    function getStore(uint idx) public view returns (uint, address, string memory, string memory, uint256, string memory)
    {
        store memory temp = stores[idx];
        return (temp.sid, temp.owner, temp.name, temp.description, temp.amount, temp.imgsrc);
    }

    function getStoreCount() public view returns (uint)
    {
        return stores.length;
    }

   function getStoreCountForOwner(address _owner) public view returns (uint)
    {
        return StoreOwnerMap[_owner].length;
    }

   function getStoreIdForOwner(uint idx) public view returns (uint)
    {
        if (getStoreCountForOwner(msg.sender) >= idx)
        {
            return StoreOwnerMap[msg.sender][idx];
        }
        else
        {
            revert("store index does not exist for this caller!");
        }
    }

    function getStoreForOwner(address _owner, uint idx) public view returns (uint, address, string memory, string memory, uint256, string memory)
    {
        if (getStoreCountForOwner(_owner) >= idx)
        {
            return getStore(StoreOwnerMap[_owner][idx]);
        }
        else
        {
            revert("store index does not exist for this owner!");
        }
    }

     function getProductCount() public view returns (uint)
    {
        return products.length;
    }

    function getProductCountForOwner(address _owner) public view returns (uint)
    {
        return ProductOwnerMap[_owner].length;
    }

   function getProductIdForOwner(uint idx) public view returns (uint)
    {
        if (getProductCountForOwner(msg.sender) >= idx)
        {
            return ProductOwnerMap[msg.sender][idx];
        }
        else
        {
            revert("product index does not exist for this caller!");
        }
    }

    function getProductForOwner(address _owner, uint idx) public view returns ( uint, address, string memory, string memory, string memory)
    {
        if (getProductCountForOwner(_owner) >= idx)
        {
            return getProduct(ProductOwnerMap[_owner][idx]);
        }
        else
        {
            revert("product index does not exist for this owner!");
        }
    }

    function getStoreProductCount() public view returns (uint)
    {
        return dmpExtraContract.getStoreProductCountExtra();
    }

    function getStoreProductIdForStore(uint _sid, uint _idx) public view returns (uint)
    {
        return dmpExtraContract.getStoreProductIdForStoreExtra(_sid, _idx);
    }

    function getStoreProductForStore(uint _sid, uint _idx) public view returns ( uint, uint, uint, uint256, uint256, uint)
    {
        return dmpExtraContract.getStoreProductForStoreExtra(_sid, _idx);
    }

   function getProduct(uint idx) public view returns ( uint, address, string memory, string memory, string memory)
    {
        product memory temp = products[idx];
        return (temp.pid, temp.owner, temp.name, temp.description, temp.imgsrc);
    }

    function getStoreProduct(uint idx) public view returns ( uint, uint, uint, uint256, uint256, uint8)
    {
        return dmpExtraContract.getStoreProductExtra(idx);
    }

    function getStoreProductCountForStore(uint _sid) public view returns (uint)
    {
        return dmpExtraContract.getStoreProductCountForStoreExtra(_sid);
    }

    function getUser(uint idx) public view returns (uint, address, string memory, uint8, uint256, uint8)
    {
        user memory temp = users[idx];
        return (temp.uid, temp.user, temp.username, uint8(temp.usertype), balances[temp.user], uint8(temp.userstatus));
    }

    function getUserCount() public view returns (uint)
    {
        return users.length;
    }

    function getUserType(address adr) public view returns (uint8)
    {
        uint8 utype = 2;
        uint arrayLength = users.length;

        for (uint i = 0; i < arrayLength; i++) {
            user memory temp = users[i];
            if (temp.user == adr) {
                utype = uint8(temp.usertype);
            }
        }
        return (utype);
    }

    function getOrder(uint idx) public view returns ( uint, uint, uint, uint, uint256, uint256)
    {
        return dmpExtraContract.getOrderExtra(idx);
    }

    function getOrderCount() public view returns (uint)
    {
        // return orders.length;
        return dmpExtraContract.getOrderCountExtra();
    }

    /*
     * Update Functions
     */

    function updateStore( uint _sid, string memory _storename, string memory _description, string memory _imgsrc)
        public returns (bool success)
    {
        /* Change to description only */
        stores[_sid].description = _description;
        stores[_sid].imgsrc = _imgsrc;
        emit storeUpdated(_sid, _storename, _description, _imgsrc, now);
        return true;
    }

   function updateProduct( uint _pid, string memory _name, string memory _description, string memory _imgsrc)
        public returns (bool success)
    {
        /* Change to description and imgsrc only */
        products[_pid].description = _description;
        products[_pid].imgsrc = _imgsrc;
        emit productUpdated(_pid, _name, _description, _imgsrc, now);
        return true;
    }

   function updateStoreProduct( uint _spid, uint _sid, uint _pid, uint256 _price, uint256 _qty_avail, uint8 _status)
        public returns (bool success)
    {
        return dmpExtraContract.updateStoreProductExtra(_spid, _sid, _pid, _price, _qty_avail, _status);
    }

    // function updateUser( uint _uid, string memory _username, uint8 _usertype, uint8 _userstatus)
    //     public returns (bool success)
    // {
    //     /* Only allow changes to usertype and userstatus */
    //     users[_uid].usertype = userType(_usertype);
    //     users[_uid].userstatus = userStatus(_usertype);
    //     emit userUpdated(_uid, _username, (uint8)(_usertype), (uint8)(_userstatus), now);
    //     return true;
    // }

    /*
     * Other Functions
     */

    function sellProduct(uint sid, uint spid, uint pid, uint qty, uint price) public payable returns (uint) {
        // calculate transaction amount
        // uint transAmount = qty * storeproducts[spid].price;
        uint transAmount = qty * price;
        // ensure buyer has sufficient funds
        // require (balances[msg.sender] >= transAmount, "buyer has insufficient funds");
        require (msg.value >= transAmount, "buyer sent insufficient funds");
        // validate sale and decrease inventory by 1
        dmpExtraContract.validateSellProductExtra(sid, spid);
        // increase store owner wallet by transaction amount
        // stores[sid].owner.transfer(transAmount);
        balances[stores[sid].owner] += msg.value;
        // require (balances[msg.sender] >= msg.value, "buyer has insufficient wei funds");
        // decrease buyers wallet by message value (Wei) - We don't store buyers wallet value (only owner)
        // balances[msg.sender].sub(msg.value);
        // increase store amount by transaction amount
        stores[sid].amount += transAmount;

        // create the order
        return createOrder(msg.sender, sid, spid, pid, price, qty);
    }

    // function withdraw(uint sid, uint256 amount) public returns (bool success)
    // {
    //     // ensure message is from store owner
    //     require(stores[sid].owner == msg.sender, "must be owner of store");
    //     // ensure store has requested funds
    //     require(stores[sid].amount >= amount, "amount greater than store value");
    //     // require(stores[sid].amount >= amount, convertIntToString(amount));
    //     // require(stores[sid].amount >= amount, convertIntToString(stores[sid].amount));
    //     // ensure owner has requested funds
    //     // require(balances[msg.sender] >= msg.value, "msg.value greater than owner balance");
    //     require(balances[msg.sender] >= amount, "amount greater than balances[msg.sender]");
    //     // decrease stores wallet by transaction amount
    //     stores[sid].amount -= amount;
    //     // increase callers wallet by transaction amount
    //     // balances[msg.sender].sub(amount);
    //     // msg.sender.transfer(msg.value);
    //     balances[msg.sender] -= amount;
    //     msg.sender.transfer(amount);
    //     return true;

    /// @notice Withdraw ether from bank
    /// @dev This does not return any excess ether sent to it
    /// @param withdrawAmount amount you want to withdraw
    /// @return The balance remaining for the user
    function withdrawStore(uint sid, uint withdrawAmount) public returns (uint remainingBal) {
        // // ensure message is from store owner
        // require(stores[sid].owner == msg.sender, "must be owner of store");
        if (withdrawAmount <= balances[msg.sender]) {
            // decrease stores wallet by transaction amount
            stores[sid].amount -= withdrawAmount;
            balances[msg.sender] -= withdrawAmount;
            msg.sender.transfer(withdrawAmount);
        }
        return balances[msg.sender];
    }

    // // See: https://github.com/OpenZeppelin/openzeppelin-solidity/
    // // for details regarding these mathematical functions
    // function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    //     if (_a == 0) {
    //         return 0;
    //     }
    //     c = _a * _b;
    //     assert(c / _a == _b);
    //     return c;
    // }

    // function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    //     return _a / _b;
    // }

    // function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    //     assert(_b <= _a);
    //     return _a - _b;
    // }

    // function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    //     c = _a + _b;
    //     assert(c >= _a);
    //     return c;
    // }

    // /// @notice Get balance
    // /// @return The balance of the user
    // // A SPECIAL KEYWORD prevents function from editing state variables;
    // // allows function to run locally/off blockchain
    // function balance() public view returns (uint) {
    //     /* Get the balance of the sender of this transaction */
    //     return balances[msg.sender];
    // }

    // /// @notice Deposit ether into bank
    // /// @return The balance of the user after the deposit is made
    // /// Add the appropriate keyword so that this function can receive ether
    // function deposit() public payable returns (uint) {
    //     /* Add the amount to the user's balance, call the event associated with a deposit,
    //       then return the balance of the user */
    //     balances[msg.sender] += msg.value;
    //     emit LogDepositMade(msg.sender, msg.value);
    //     return balances[msg.sender];
    // }

    // /// @notice Withdraw ether from bank
    // /// @dev This does not return any excess ether sent to it
    // /// @param withdrawAmount amount you want to withdraw
    // /// @return The balance remaining for the user
    // function withdraw(uint withdrawAmount) public returns (uint remainingBal) {
    //     /* If the sender's balance is at least the amount they want to withdraw,
    //        Subtract the amount from the sender's balance, and try to send that amount of ether
    //        to the user attempting to withdraw. IF the send fails, add the amount back to the user's balance
    //        return the user's balance.*/
    //     if (withdrawAmount <= balances[msg.sender]) {
    //         balances[msg.sender] -= withdrawAmount;
    //         msg.sender.transfer(withdrawAmount);
    //     }
    //     return balances[msg.sender];
    // }

    /// @notice Get balance
    /// @return The balance of the user
    // A SPECIAL KEYWORD prevents function from editing state variables;
    // allows function to run locally/off blockchain
    function balance() public view returns (uint) {
        /* Get the balance of the sender of this transaction */
        return balances[msg.sender];
    }

    function depositsBalance() public view returns (uint) {
        return address(this).balance;
    }

    // Fallback function - Called if other functions don't match call or
    // sent ether without data
    // Typically, called when invalid data is sent
    // Added so ether sent to this contract is reverted if the contract fails
    // otherwise, the sender's money is transferred to contract
    function() external payable {
        revert("no call matched, reverting funds"); //The same behavior if made not payable or if fallback omitted
    }

}