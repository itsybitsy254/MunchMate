MunchMate Food Delivery App

MunchMate is a web application designed for food delivery, allowing users to browse menus, add items to their cart, and place orders. The application fetches menu data from a local/hosted JSON server and provides an intuitive interface for managing orders and navigating through different sections.

Technologies Used
HTML
CSS
JavaScript
JSON Server

The app can be acessed via ; [MunchMate-Food-Delivery-App](https://munch-mate-nine.vercel.app/)

Getting Started

1 Clone the Repository
 git clone git@github.com:itsybitsy254/MunchMate.git

#2 Install Dependencies
 npm install

#Start the JSON Server
 json-server --watch db.json --port 3000

#Access the App
#Open your browser and navigate to:
http://localhost:5500 (Frontend)
http://localhost:3000 (Backend)

#Usage

#Fetch Menu Items: The application will load the list of menu items from the JSON server.
#view Menu Details: Click on a menu category to view available items and their details.
#Add to Cart: Click the "Add to Cart" button to add items to your cart.
#View Cart: Navigate to the Cart section to review and modify your cart.
#complete Order: Proceed to Checkout to finalize your order.


#API Endpoints
#The application interacts with the following API endpoints:

#Get Menu Items: GET https://munchdb.onrender.com/menu
#Get Menu Item Details: GET https://munchdb.onrender.com/menu/:id
#Update Cart: PATCH https://munchdb.onrender.com/cart/:id