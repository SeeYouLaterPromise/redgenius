from webdriver_manager.chrome import ChromeDriverManager

driver_path = ChromeDriverManager().install()
print(driver_path)
