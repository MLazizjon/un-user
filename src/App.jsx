import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import MainSite from "./pages/catalog/MainSite";
import CategoryDetail from "./pages/product/CategoryDetail";
import LanguageSelect from "./pages/language/LanguageSelect";
import { supabase } from "./supabase/supabesa";

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState(
    () => localStorage.getItem("app_language") || "uz"
  );

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState("main");
  const [showLanguagePage, setShowLanguagePage] = useState(true);

  // Global Savatcha holati va Modal nazorati
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState("cart"); // 'cart' | 'checkout'
  const [tableNumber, setTableNumber] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [showLanguagePage, selectedCategory]);

  // Savatcha modali ochilganda asosiy oynadagi scrollni qulflash
  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add("cart-open");
    } else {
      document.body.classList.remove("cart-open");
    }
    return () => {
      document.body.classList.remove("cart-open");
    };
  }, [isCartOpen]);

  // Savatchaga mahsulot qo'shish
  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const exist = prevItems.find((item) => item.id === product.id);
      if (exist) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Savatchadagi sonini o'zgartirish (+1, -1)
  const handleUpdateQuantity = (productId, delta) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  // Buyurtmani Supabase xotirasiga jo'natish
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber) {
      alert(
        currentLanguage === "uz"
          ? "Iltimos, stol raqamini kiriting!"
          : currentLanguage === "ru"
          ? "Пожалуйста, введите номер стола!"
          : "Please enter your table number!"
      );
      return;
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        table_number: parseInt(tableNumber, 10),
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total_price: totalPrice,
        status: "pending",
      };

      const { error } = await supabase.from("orders").insert([orderPayload]);

      if (error) throw error;

      alert(
        currentLanguage === "uz"
          ? "Buyurtmangiz muvaffaqiyatli qabul qilindi!"
          : currentLanguage === "ru"
          ? "Ваш заказ успешно принят!"
          : "Your order has been successfully placed!"
      );

      setCartItems([]);
      setTableNumber("");
      setCartStep("cart");
      setIsCartOpen(false);
    } catch (err) {
      console.error("Buyurtma yuborishda xatolik:", err);
      alert(
        currentLanguage === "uz"
          ? "Xatolik yuz berdi. Qayta urinib ko'ring."
          : currentLanguage === "ru"
          ? "Произошла ошибка. Попробуйте еще раз."
          : "An error occurred. Please try again."
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleMenuToggle = () => {
    console.log("Burger menyu bosildi");
  };

  const handleRestart = () => {
    setSelectedCategory(null);
    setCurrentPage("main");
    setShowLanguagePage(true);

    sessionStorage.setItem("mainScrollPosition", window.scrollY);
    sessionStorage.setItem("returnPage", "main");
  };

  const openLanguagePage = () => {
    if (selectedCategory && currentPage === "category") {
      sessionStorage.setItem("categoryScrollPosition", window.scrollY);
      sessionStorage.setItem("returnPage", "category");
    } else {
      sessionStorage.setItem("mainScrollPosition", window.scrollY);
      sessionStorage.setItem("returnPage", "main");
    }

    setShowLanguagePage(true);
  };

  const handleLanguageSelect = (lang) => {
    localStorage.setItem("app_language", lang);
    setCurrentLanguage(lang);
    setShowLanguagePage(false);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const returnPage = sessionStorage.getItem("returnPage");

        const key =
          returnPage === "category"
            ? "categoryScrollPosition"
            : "mainScrollPosition";

        const savedScroll = Number(
          sessionStorage.getItem(key) || 0
        );

        window.scrollTo({
          top: savedScroll,
          behavior: "instant",
        });
      }, 150);
    });
  };

  const totalCartPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="app-main-container">
      {showLanguagePage ? (
        <LanguageSelect onSelectLanguage={handleLanguageSelect} />
      ) : currentPage === "category" && selectedCategory ? (
        <CategoryDetail
          category={selectedCategory}
          currentLang={currentLanguage}
          onBack={() => {
            setSelectedCategory(null);
            setCurrentPage("main");
          }}
          onChangeLang={openLanguagePage}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onOpenCart={() => setIsCartOpen(true)}
        />
      ) : (
        <MainSite
          currentLanguage={currentLanguage}
          onMenuToggle={handleMenuToggle}
          onChangeLanguage={openLanguagePage}
          onRestart={handleRestart}
          onSelectCategory={(category) => {
            setSelectedCategory(category);
            setCurrentPage("category");
          }}
          cartItems={cartItems}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Savatcha va Buyurtma berish Modali */}
      {isCartOpen && (
        <div
          className="cart-modal-overlay"
          onClick={() => {
            setIsCartOpen(false);
            setCartStep("cart");
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            className="cart-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              width: "100%",
              maxWidth: "500px",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              padding: "20px",
              boxSizing: "border-box",
              maxHeight: "85vh",
              overflowY: "auto",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                {cartStep === "cart"
                  ? currentLanguage === "uz"
                    ? "Savatcha"
                    : currentLanguage === "ru"
                    ? "Корзина"
                    : "Cart"
                  : currentLanguage === "uz"
                  ? "Buyurtma berish"
                  : currentLanguage === "ru"
                  ? "Оформление заказа"
                  : "Checkout"}
              </h2>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCartStep("cart");
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ✕
              </button>
            </div>

            {cartStep === "cart" ? (
              <>
                {cartItems.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#888",
                      margin: "30px 0",
                    }}
                  >
                    {currentLanguage === "uz"
                      ? "Savatchangiz bo'sh"
                      : currentLanguage === "ru"
                      ? "Ваша корзина пуста"
                      : "Your cart is empty"}
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {cartItems.map((item) => {
                      const name =
                        typeof item.name === "object"
                          ? item.name[currentLanguage] ||
                            item.name.ru ||
                            item.name.uz
                          : item.name;
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#f9f9f9",
                            padding: "10px",
                            borderRadius: "10px",
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: "10px" }}>
                            <div
                              style={{ fontWeight: "600", fontSize: "14px" }}
                            >
                              {name}
                            </div>
                            <div style={{ color: "#666", fontSize: "13px" }}>
                              {Number(item.price).toLocaleString()} so'm
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              background: "#eee",
                              borderRadius: "8px",
                              padding: "4px 8px",
                            }}
                          >
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, -1)
                              }
                              style={{
                                border: "none",
                                background: "#fff",
                                width: "26px",
                                height: "26px",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                fontWeight: "bold",
                                minWidth: "16px",
                                textAlign: "center",
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              style={{
                                border: "none",
                                background: "#fff",
                                width: "26px",
                                height: "26px",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "12px",
                        borderTop: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      <span>
                        {currentLanguage === "uz"
                          ? "Jami:"
                          : currentLanguage === "ru"
                          ? "Итого:"
                          : "Total:"}
                      </span>
                      <span>{totalCartPrice.toLocaleString()} so'm</span>
                    </div>

                    <button
                      onClick={() => setCartStep("checkout")}
                      style={{
                        marginTop: "16px",
                        width: "100%",
                        padding: "14px",
                        backgroundColor: "#ff4d4f",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        fontSize: "16px",
                        cursor: "pointer",
                      }}
                    >
                      {currentLanguage === "uz"
                        ? "Davom etish"
                        : currentLanguage === "ru"
                        ? "Продолжить"
                        : "Continue"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleOrderSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    {currentLanguage === "uz"
                      ? "Stol raqamini kiriting:"
                      : currentLanguage === "ru"
                      ? "Введите номер стола:"
                      : "Enter table number:"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="E.g. 5"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setCartStep("cart")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "#eee",
                      color: "#333",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {currentLanguage === "uz"
                      ? "Ortga"
                      : currentLanguage === "ru"
                      ? "Назад"
                      : "Back"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    style={{
                      flex: 2,
                      padding: "12px",
                      backgroundColor: "#ff4d4f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      opacity: isSubmittingOrder ? 0.7 : 1,
                    }}
                  >
                    {isSubmittingOrder
                      ? currentLanguage === "uz"
                        ? "Yuborilmoqda..."
                        : currentLanguage === "ru"
                        ? "Отправка..."
                        : "Submitting..."
                      : currentLanguage === "uz"
                      ? "Tasdiqlash"
                      : currentLanguage === "ru"
                      ? "Подтвердить"
                      : "Confirm"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}