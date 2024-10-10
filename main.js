import Chart from 'chart.js/auto';

// 初始化图表
const coordinateChart = new Chart(document.getElementById('coordinate-chart'), {
    type: 'scatter',
    data: {
        datasets: [{
            label: '坐标点',
            data: [],
            backgroundColor: 'red'
        }]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                min: -100,
                max: 100,
                ticks: {
                    stepSize: 20
                },
                grid: {
                    color: (context) => context.tick.value === 0 ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'
                }
            },
            y: {
                type: 'linear',
                position: 'left',
                min: -100,
                max: 100,
                ticks: {
                    stepSize: 20
                },
                grid: {
                    color: (context) => context.tick.value === 0 ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        maintainAspectRatio: false
    }
});

const rcsChart = new Chart(document.getElementById('rcs-chart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'RCS',
            data: [],
            borderColor: 'blue',
            pointStyle: 'triangle',
            pointRadius: 6
        }]
    },
    options: {
        maintainAspectRatio: false
    }
});

const speedDistanceChart = new Chart(document.getElementById('speed-distance-chart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: '速度',
                data: [],
                borderColor: 'green',
                yAxisID: 'y-speed'
            },
            {
                label: '距离',
                data: [],
                borderColor: 'orange',
                yAxisID: 'y-distance'
            }
        ]
    },
    options: {
        scales: {
            'y-speed': {
                type: 'linear',
                position: 'left',
                min: 0,
                max: 2.00,
                title: {
                    display: true,
                    text: '速度 (m/s)'
                }
            },
            'y-distance': {
                type: 'linear',
                position: 'right',
                min: 0,
                max: 60,
                title: {
                    display: true,
                    text: '距离 (m)'
                }
            }
        },
        maintainAspectRatio: false
    }
});

// 模拟数据生成
let isTracking = false;
let isDataTransmitting = false;
let dataFrequency = 1;
let simulationInterval;

function generateRandomData() {
    const longitude = (Math.random() * 200 - 100).toFixed(4);
    const latitude = (Math.random() * 200 - 100).toFixed(4);
    const rcs = Math.random() * 10;
    const speed = Math.random() * 2; // 修改为0-2范围
    const distance = Math.random() * 60; // 修改为0-60范围

    return { longitude, latitude, rcs, speed, distance };
}

function updateCharts(data) {
    // 更新坐标图
    coordinateChart.data.datasets[0].data.push({ x: parseFloat(data.longitude), y: parseFloat(data.latitude) });
    coordinateChart.update();

    // 更新RCS图
    rcsChart.data.labels.push(new Date().toLocaleTimeString());
    rcsChart.data.datasets[0].data.push(data.rcs);
    if (rcsChart.data.labels.length > 20) {
        rcsChart.data.labels.shift();
        rcsChart.data.datasets[0].data.shift();
    }
    rcsChart.update();

    // 更新速度和距离图
    speedDistanceChart.data.labels.push(new Date().toLocaleTimeString());
    speedDistanceChart.data.datasets[0].data.push(data.speed);
    speedDistanceChart.data.datasets[1].data.push(data.distance);
    if (speedDistanceChart.data.labels.length > 20) {
        speedDistanceChart.data.labels.shift();
        speedDistanceChart.data.datasets[0].data.shift();
        speedDistanceChart.data.datasets[1].data.shift();
    }
    speedDistanceChart.update();

    // 更新经纬度显示
    document.getElementById('longitude-value').textContent = data.longitude;
    document.getElementById('latitude-value').textContent = data.latitude;
}

// 按钮事件处理
document.getElementById('toggle-tracking').addEventListener('click', () => {
    isTracking = !isTracking;
    document.getElementById('toggle-tracking').textContent = isTracking ? '停止循迹' : '启动循迹';
    document.getElementById('positioning-status').style.backgroundColor = isTracking ? 'green' : 'red';
});

document.getElementById('toggle-data').addEventListener('click', () => {
    isDataTransmitting = !isDataTransmitting;
    document.getElementById('toggle-data').textContent = isDataTransmitting ? '停止数据传输' : '开启数据传输';
    document.getElementById('radar-status').style.backgroundColor = isDataTransmitting ? 'green' : 'red';

    if (isDataTransmitting) {
        simulationInterval = setInterval(() => {
            if (isTracking) {
                updateCharts(generateRandomData());
            }
        }, 1000 / dataFrequency);
    } else {
        clearInterval(simulationInterval);
    }
});

document.getElementById('clear-data').addEventListener('click', () => {
    coordinateChart.data.datasets[0].data = [];
    rcsChart.data.labels = [];
    rcsChart.data.datasets[0].data = [];
    speedDistanceChart.data.labels = [];
    speedDistanceChart.data.datasets[0].data = [];
    speedDistanceChart.data.datasets[1].data = [];
    coordinateChart.update();
    rcsChart.update();
    speedDistanceChart.update();
    document.getElementById('longitude-value').textContent = '0.0000';
    document.getElementById('latitude-value').textContent = '0.0000';
});

document.getElementById('set-frequency').addEventListener('click', () => {
    const newFrequency = parseInt(document.getElementById('data-frequency').value);
    if (newFrequency >= 1 && newFrequency <= 5) {
        dataFrequency = newFrequency;
        if (isDataTransmitting) {
            clearInterval(simulationInterval);
            simulationInterval = setInterval(() => {
                if (isTracking) {
                    updateCharts(generateRandomData());
                }
            }, 1000 / dataFrequency);
        }
    } else {
        alert('请输入1到5之间的整数');
    }
});

// 锁定和解锁功能
const lockOverlay = document.getElementById('lock-overlay');
const lockButton = document.getElementById('lock-button');
const unlockButton = document.getElementById('unlock-button');
const unlockPassword = document.getElementById('unlock-password');

lockButton.addEventListener('click', () => {
    lockOverlay.classList.remove('hidden');
});

unlockButton.addEventListener('click', () => {
    if (unlockPassword.value === '1234') {
        lockOverlay.classList.add('hidden');
        unlockPassword.value = '';
    } else {
        alert('密码错误');
    }
});