import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Button, Checkbox, Link, Typography, Container, FormControlLabel, CssBaseline, ThemeProvider, TextField, Paper, Grid, Divider,InputLabel, Select, MenuItem } from '@mui/material';
import ModalUnstyled from '@mui/base/ModalUnstyled';

import {commerce} from './lib/commerce'

import { Elements, CardElement, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

/*
curl -X GET \
    -G "https://api.chec.io/v1/products/prod_RqEv5xzL10wZz4/variants" \
    -H "X-Authorization: sk_test_39980259115a0d9753812433d6740aa60b83dc9a64fba" | jq .


curl -X GET \
    -G "https://api.chec.io/v1/products/prod_RqEv5xzL10wZz4/variant_groups" \
    -H "X-Authorization: sk_test_39980259115a0d9753812433d6740aa60b83dc9a64fba" | jq .

// add by variant

curl -X POST \
    "https://api.chec.io/v1/carts/cart_7ZAMo1XpEMwNJ4" \
    -H "X-Authorization: sk_test_39980259115a0d9753812433d6740aa60b83dc9a64fba" \
    -H "Content-Type: application/json" \
    -d '{"id":"prod_Op1YoVEALgwXLv","variant_id":"vrnt_LvJjoPbObRle0n"}'
*/

export default function Checkout() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [postcode, setPostcode] = useState('');
  const [address1, setAddress1] = useState('');
  const [shippingCountries, setShippingCountries] = useState([]);
  const [shippingCountry, setShippingCountry] = useState('');
  const [shippingSubdivisions, setShippingSubdivisions] = useState([]);
  const [shippingSubdivision, setShippingSubdivision] = useState('');

  // handleCheckout
  const [errorMessage, setErrorMessage] = useState('')


  const [ customer, setCustomer ] = useState(undefined)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)

  const [checkoutToken, setCheckoutToken] = useState(null);


  const handleSubmit = async (event, elements, stripe) => {
    //?????????URL????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? 
    //???????????????event.preventDefault()????????????????????????????????????????????????????????????????????????????????? 
    //event.preventDefault()????????????????????????????????????????????????????????????????????????????????????????????????????????????
    event.preventDefault();
    const data = new FormData(event.currentTarget)
    for (var value of data.values()) {
        console.log(value)
    }
    const orderData={
      firstname: data.get('firstname'),
      lastname: data.get('lastname'),
      email: data.get('email'),
      postcode: data.get('postcode'),
      address1: data.get('address1'),
      shippingCountry: data.get('shippingCountry'),
      shippingSubdivision: data.get('shippingSubdivision')
    }
    console.log(orderData)

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({ type: 'card', card: cardElement });
    console.log({ error, paymentMethod })

    if (error) {
      console.log('[error]', error);
    } else {
      // required fields
      // https://commercejs.com/docs/api/?javascript--cjs#capture-order
      const orderData = {
        line_items: checkoutToken.live.line_items,
        customer: { id:localStorage.getItem('token') },
        //shipping: { name: 'International', street: shippingData.address1, town_city: shippingData.city, county_state: shippingData.shippingSubdivision, postal_zip_code: shippingData.zip, country: shippingData.shippingCountry },
        //fulfillment: { shipping_method: shippingData.shippingOption },
        payment: {
          // Test Gateway is enabled by default, and is used when you submit orders with
          // your sandbox API key
          gateway: 'test_gateway',
          card: {
            number: '4242 4242 4242 4242',
            expiry_month: '01',
            expiry_year: '2023',
            cvc: '123',
            postal_zip_code: '94103',
          },
        },
        /*
        payment: {
          gateway: 'stripe',
          stripe: {
            payment_method_id: paymentMethod.id,
          },
        },
        */
      };
      handleCaptureCheckout(checkoutToken.id, orderData);
    }
  };

  useEffect(() => {
    const cartId=localStorage.getItem('cart_id');
    if(cartId===null)window.location.href="/signin"
    // create checkouttoken from customer cart
    const fetchCart = async () => {
      // Retrieve the customers current cart (tracked by their browser)
      await commerce.cart.retrieve(cartId).then(cart => {
        console.log(cart)
        //console.log(JSON.stringify(cart, null, 2))
        setCart(cart)
            // generate checkoutToken from current cart
      if (cart.id) {
      const generateCheckoutToken = async () => {
        try {
          // Generate a token from the cart that was previously created or retrieved
          const token = await commerce.checkout.generateToken(cart.id, { type: 'cart' });
          setCheckoutToken(token);
          console.log(token)
        } catch {
          console.log("checkout token generation failed")
        }
      };
      generateCheckoutToken();
    }
      });
    }
    fetchCart();

    console.log(cart)
    let customerId=localStorage.getItem('token')
    console.log(customerId)
    console.log(customerId)
    const url = new URL(
      "https://api.chec.io/v1/customers/"+customerId
    );
  
    let headers = {
      "X-Authorization": "sk_test_39980259115a0d9753812433d6740aa60b83dc9a64fba",
      "Accept": "application/json",
      "Content-Type": "application/json",
    };
  
    fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then(response => response.json())
      .then(json => {
        console.log(json);
        setCustomer(json);
        setFirstname(json.firstname)
        setLastname(json.lastname)
        setEmail(json.email)
        setLoading(false)
      });

  }, []) // [] is for useEffect?????????????????????1???????????????????????????

  const handleCaptureCheckout = async (checkoutTokenId, newOrder) => {
    try {
      // Captures an order and payment by converting a checkout token and necessary data into an order object, and charging all related transactions.
      const incomingOrder = await commerce.checkout.capture(checkoutTokenId, newOrder)
      console.log(incomingOrder)
      // create new cart and add to auth API
      const createCart = async () => {
        // Retrieve the customers current cart (tracked by their browser)
        await commerce.cart.refresh()
        .then(cart => {
            console.log(cart)
            localStorage.setItem('cart_id', cart.id)
            const customerId=localStorage.getItem('token')
            const url3 = new URL(
              process.env.REACT_APP_CUSTOMERS_API+"/api/customers/cart/"+customerId+"/"+cart.id
            );

            let headers3 = {
              "Content-Type": "application/json  charset=UTF-8",
              "Accept": "application/json",
            };
            fetch(url3, {
              method: "GET",
              headers: headers3
            })
            .then(response => response.json())
            .then(json => {
                console.log(json);
                // TODO  redirect to where??
            });

        });
      }
      createCart()
    } catch (error) {
      setErrorMessage(error.data.error.message)
    }
  }



  if(loading)return "loading"
  if(cart?.id===undefined)return 'cart loading'
  if(checkoutToken?.live===undefined)return 'token loading'

  return (
    <Paper elevation={0} sx={{
      flexGrow: 1,
      backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    }} >
      <Grid container spacing={0} justifyContent="center" alignItems="center">

        <Grid item md={7} >
        <Item elevation={0} >
        <Grid component="form" noValidate onSubmit={handleSubmitTest} container spacing={2} justifyContent='center' alignItems='center' >

        <Grid item xs={6} md={12}>
        <Item elevation={0} ><Typography variant="h5">????????????</Typography></Item>
        </Grid>
        <Grid item xs={12} sm={12}>
              <InputLabel id="demo-simple-select-label">???</InputLabel>
              <Select value={shippingCountry} fullWidth onChange={(e) => setShippingCountry(e.target.value)}
                  id="demo-simple-select"
                  label="Age"
              >
                {Object.entries(shippingCountries).map(([code, name]) => ({ id: code, label: name })).map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={12}>
            <InputLabel id="demo-simple-select-label">????????????</InputLabel>
              <Select value={shippingSubdivision} fullWidth onChange={(e) => setShippingSubdivision(e.target.value)}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Age"
              >
                {Object.entries(shippingSubdivisions).map(([code, name]) => ({ id: code, label: name })).map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
        </Grid>
        <Grid item xs={12} sm={4}>
        <TextField
        required
        fullWidth
        id="postcode"
        label="????????????"
        name="postcode"
        onChange={(e) => setPostcode(e.target.value)}
        helperText="Enter your email"
        />
        </Grid>
        <Grid item xs={12} sm={8}>
        <TextField
        required
        fullWidth
        id="address1"
        label="??????"
        name="address1"
        onChange={(e) => setAddress1(e.target.value)}
        helperText="Enter your email"
        />
        </Grid>
    
        <Grid item xs={6} md={12}>
        <Item elevation={0} ><Typography variant="h5">????????????</Typography></Item>
        </Grid>

        <Grid item xs={12} sm={12}>
        <TextField
        required
        fullWidth
        id="lastname"
        label="???"
        name="lastname"
        defaultValue={lastname}
        onChange={(e) => setEmail(e.target.value)}
        helperText="Enter your email"
        />
        </Grid>

        <Grid item xs={12} sm={12}>
        <TextField
        autoComplete="given-name"
        name="firstname"
        required
        fullWidth
        id="firstname"
        label="???"
        defaultValue={firstname}
        onChange={(e) => setEmail(e.target.value)}
        helperText="Enter your email"
        />
        </Grid>

        <Grid item xs={12}>
        <TextField
        required
        fullWidth
        id="email"
        label="????????????????????????Gmail?????????????????????????????????"
        name="email"
        defaultValue={email}
        onChange={(e) => setEmail(e.target.value)}
        helperText="Enter your email"
        />
        </Grid>

      </Grid>
      </Item>

      <Grid item xs={6} md={12}>
        <Item elevation={0} ><Typography variant="h5">??????????????????</Typography></Item>
        </Grid>
        <Grid item xs={6} md={12}>
        <Item elevation={0} >
        <Elements stripe={stripePromise}>
        <ElementsConsumer>{({ elements, stripe }) => (
          <form onSubmit={(e) => handleSubmit(e, elements, stripe)}>
            <CardElement />
            <br /> <br />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button fullWidth type="submit" variant="contained" disabled={!stripe} style={{ backgroundColor: '#1C2331', color: '#FFFF', height:60 }} >
              ????????? {checkoutToken.live.subtotal.formatted_with_symbol}
              </Button>
            </div>
          </form>
        )}
        </ElementsConsumer>
        </Elements>
        </Item>
        </Grid>

      </Grid>


      <Grid item md={5} >
      <Item elevation={0} >
      <Grid item xs={6} md={12}>
        <Item elevation={0} ><Typography variant="h5">????????????????????????</Typography></Item>
        </Grid>
      <Divider sx={{margin:'10px'}}/>
      <Grid item xs={6} md={12}>
        <Item elevation={0} ><ModalUnstyledDemo /></Item>
        </Grid>
      <Grid item xs={6} md={12}>
        <Item elevation={0} ><Typography variant="h5">??????: {cart.subtotal.formatted_with_code}</Typography></Item>
        </Grid>
      <Divider sx={{margin:'10px'}}/>
         
      </Item>
      </Grid>


      </Grid>
    </Paper>
  );
}

// for testing form fubmission
const handleSubmitTest = (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget)
  for (var value of data.values()) {
      console.log(value)
  }
  const orderData={
    firstname: data.get('firstname'),
    lastname: data.get('lastname'),
    email: data.get('email'),
    postcode: data.get('postcode'),
    address1: data.get('address1'),
    shippingCountry: data.get('shippingCountry'),
    shippingSubdivision: data.get('shippingSubdivision')
  }
  console.log(orderData)
};


const StyledModal = styled(ModalUnstyled)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Backdrop = styled('div')`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const style = {
  width: 400,
  bgcolor: 'background.paper',
  p: 2,
  px: 4,
  pb: 3,
};

function ModalUnstyledDemo() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="outlined" type="button" onClick={handleOpen}>
        ??????????????????????
      </Button>
      <StyledModal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={handleClose}
        BackdropComponent={Backdrop}
      >
        <Paper sx={style}>
          <h2 id="unstyled-modal-title">??????????????????</h2>
          <p id="unstyled-modal-description">???????????????????????????????????????????

STEP1. ??????????????????????????????4~6????????????

???????????????????????????????????????????????????????????????????????????

??????????????????????????????????????????????????????????????????????????????????????????

STEP2. ???????????????????????????????????????????????????????????????7~10????????????

?????????????????????????????????????????????????????????????????????

??????????????????????????????????????????????????????????????????????????????

STEP3. ????????????????????????????????????14~26????????????

???????????????????????????????????????????????????????????????????????????????????????

???????????????????????????????????????????????????????????????</p>
        </Paper>
      </StyledModal>
    </div>
  );
}