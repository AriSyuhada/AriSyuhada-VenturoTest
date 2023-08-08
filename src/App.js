import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [menus, setMenus] = useState([]);
  const [cartIsShow, setCartIsShow] = useState(false);
  const [cartMenus, setCartMenus] = useState([]);
  const [voucher, setVoucher] = useState({});
  const [total, setTotal] = useState(0);

  const fetchData = () => {
    fetch('https://tes-mobile.landa.id/api/menus')
    .then(response => {
      return response.json();
    })
    .then(data => {
      setMenus(data.datas);
    });
  }
  
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setTotal(
      cartMenus.reduce((total, cartMenu) => {
        return total + (cartMenu.harga * cartMenu.quantity);
      }, 0)
    );
  }, [cartMenus])

  const handleAddMenuToCart = (item) => {
    let isExist = cartMenus.reduce((isExist, cartMenu) => {
      return isExist || (cartMenu.id === item.id)
    }, false);

    if (!isExist) {
      setCartMenus([
        ...cartMenus,
        {
          ...item,
          quantity: 1,
          note: '',
        }
      ]);
    }
  }

  const handleRemoveMenuToCart = (id) => {
    setCartMenus(
      cartMenus.filter((cartMenu) => {
        return cartMenu.id !== id;
      })
    );
  }

  const handleIncreaseQuantity = (id) => {
    setCartMenus(
      cartMenus.map((cartMenu) => {
        if (cartMenu.id !== id) {
          return cartMenu;
        }
        let newCartMenu = {
          ...cartMenu,
          quantity: cartMenu.quantity + 1,
        };
        return newCartMenu;
      })
    );
  }

  const handleDecreaseQuantity = (id) => {
    setCartMenus(
      cartMenus.map((cartMenu) => {
        if (cartMenu.id !== id) {
          return cartMenu;
        }
        if (cartMenu.quanity === 0) {
          return cartMenu;
        }
        return {
          ...cartMenu,
          quantity: cartMenu.quantity - 1,
        }
      })
    );
  }

  const handleInputNote = (id, input) => {
    setCartMenus(
      cartMenus.map((cartMenu) => {
        if (cartMenu.id !== id) {
          return cartMenu;
        }
        let newCartMenu = {
          ...cartMenu,
          note: input,
        };
        return newCartMenu;
      })
    );
  }

  const handleVoucher = (input) => {
    fetch('https://tes-mobile.landa.id/api/vouchers?kode=' + input)
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (data.status_code === 200) {
        setVoucher(data.datas);
      } else if (data.status_code === 204) {
        setVoucher(data)
      }
    });
  }

  const handleOrder = () => {
    let orderPrice = 0;
    if (voucher.nominal < total) {
      orderPrice = total - voucher.nominal;
    }
    fetch('https://tes-mobile.landa.id/api/order', {
      method: 'POST',
      body: JSON.stringify({
        voucher_id: voucher.kode !== null || voucher.kode !== undefined ? voucher.kode : '',
        nominal_diskon: voucher.kode !== null || voucher.kode !== undefined ? voucher.nominal : 0,
        nominal_pesanan: orderPrice,
        items: cartMenus.map((cartMenu) => {
          return {
            id: cartMenu.id,
            harga: cartMenu.harga,
            catatan: cartMenu.note !== null || cartMenu.note !== undefined ? cartMenu.note : '',
          };
        })
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      alert(data.message);
    });
  }

  return (
    <div className="App h-full w-full relative">
      <div>
        <div className='flex flex-row justify-between items-center bg-white p-6'>
          <h1>Main Course</h1>
          <div onClick={() => setCartIsShow(true)} className='flex flex-row border-[2px] p-3 border-teal-400 rounded-sm relative bg-transparent '>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <p>Keranjang</p>
            <p className='absolute top-[-15px] right-[-15px] p-2 text-white bg-red-500 rounded-full'>{cartMenus.length}</p>
          </div>
        </div>
        <div className='bg-slate-200 p-8'>
          <h2>Menu list</h2>
          <div className='flex flex-row flex-wrap'>
            {menus.map((menu) => (
              <div className='w-[20rem] p-3 bg-white m-2 flex flex-col items-center' key={menu.id}>
                <div className='w-[10rem] flex justify-center'>
                  <img className=' object-cover h-[10rem]' src={menu.gambar} alt={menu.nama} />
                </div>
                <p>{menu.nama}</p>
                <p className='text-teal-400'>Rp. {menu.harga}</p>
                <button onClick={(e) => handleAddMenuToCart(menu)} className=' bg-teal-400 p-4 text-white'>Tambahkan ke keranjang</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      { cartIsShow ? 
        <div className='absolute h-full w-[30rem] top-0 right-0 bg-white'>
          <div className='relative'>
            <div className='flex flex-row justify-between items-center p-6'>
              <h1>Main Course</h1>
              <div onClick={() => setCartIsShow(false)} className='text-teal-400 rounded-sm'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
            <div className='flex flex-col w-full overflow-y-auto'>
              {cartMenus.map((menu) => (
                <div key={menu.id} className='relative flex flex-col p-5'>
                  <div className="flex flex-row">
                    <div className='w-[8rem] flex-1'>
                      <img className=' object-contain h-[5rem]' src={menu.gambar} alt={menu.nama} />
                    </div>
                    <div className="flex flex-col items-start mx-4 flex-[3]">
                      <p className='font-bold'>{menu.nama}</p>
                      <p className='text-teal-400'>Rp. {menu.harga}</p>
                    </div>
                    <div className="flex flex-col items-center justify-end flex-1">
                      <div className="flex flex-row justify-between items-center">
                        <button onClick={() => handleIncreaseQuantity(menu.id)} className='bg-blue-400 text-white p-1 w-6'>+</button>
                        <p className='w-12'>{menu.quantity}</p>
                        <button onClick={() => handleDecreaseQuantity(menu.id)} className='bg-blue-400 text-white p-1 w-6'>-</button>
                      </div>
                    </div>
                  </div>
                  <div className='absolute top-5 right-5'>
                    <button onClick={() => handleRemoveMenuToCart(menu.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <input onChange={(e) => handleInputNote(menu.id, e.target.value)} className='mt-3 bg-slate-100 border-2 p-2' type="text" placeholder='Masukkan catatan disini' />
                </div>
              ))}
              <div className='flex flex-col p-5'>
                <p className=' text-left'>Tambah Voucher</p>
                <input onChange={(e) => handleVoucher(e.target.value)} className='mt-3 bg-slate-100 border-2 p-2' type='text' placeholder='Masukkan vouchermu disini...' />
                {
                  voucher.nominal !== null ?
                  <p>Kode voucher dengan nominal Rp. {voucher.nominal} akan digunakan</p>
                  :
                  <p>Kode voucher tidak ditemukan</p>
                }
              </div>
              <div className='mt-auto mb-0 p-5'>
                <div className='flex flex-row justify-between'>
                  <p>Total</p>
                  <p>Rp. 
                    {
                      total < voucher.nominal ? 0 : total - voucher.minimal
                    }
                  </p>
                </div>
                <button onClick={() => handleOrder()} className=' bg-blue-400 text-white w-full p-3'>
                  Buat Pesanan
                </button>
              </div>
            </div>
          </div>
        </div>
        : 
        <></>
      }
    </div>
  );
}

export default App;
