// IP 转换器的主要逻辑
function convertIP() {
    const ipInput = document.getElementById('ip-input');
    const ipText = ipInput.value.trim();

    if (!ipText) return;
    const statusElement = document.getElementById('status');
    statusElement.textContent = '';

    try {
        let ipConverter = new IPConverter(ipText);
        const result = ipConverter.toString();

        // 显示结果
        if (ipConverter.type === IPConverter.Type.IPV4) {
            statusElement.textContent = "IPv4 Address: \n" + JSON.stringify(result);
        } else if (ipConverter.type === IPConverter.Type.IPV6) {
            statusElement.textContent = "IPv6 Address: \n" + JSON.stringify(result);
        }
    } catch (error) {
        console.error('Error:', error);
        statusElement.textContent = '错误：请检查输入是否有效。';
        statusElement.style.color = '#666';
    }
}