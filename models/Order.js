import { placeOrder } from "../api";

const handlePlaceOrder = () => {
  const orderData = {
    userId: "user1", // or from login session
    items: cart,
    total: cart.reduce((sum, item) => sum + item.quantity * 100, 0), // adjust price
  };

  placeOrder(orderData)
    .then(() => alert("Order placed successfully"))
    .catch((err) => console.log("Order failed", err));
};
