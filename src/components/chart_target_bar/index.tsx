import EChartsReact, { EChartsOption } from "echarts-for-react";


export interface IChartTargetBarProps {
    data?:any
}

export const ChartTargetBar: React.FC<IChartTargetBarProps> = ( {data} ) => {
    var progressLineLength = 450;
    var maxValue = 100;
    var value = 70;

    const options:EChartsOption = {
        graphic: {
            elements: [
              {
                type: 'group',
                left: 'center',
                top: 'center',
                children: [
                  {
                    type: 'rect',
                    shape: {
                      x:0,
                      y:20,
                      width: progressLineLength,
                      height:10,
                    },
                    style: {
                      fill: '#E5E5E5'
                    }
                  },
                  {
                    type: 'rect',
                    shape: {
                      x:0,
                      y:20,
                      width: progressLineLength*value/maxValue,
                      height:10,
                        },
                    style: {
                      fill: '#3874CB'
                        }
                },
                {
                    type: 'sector',
                    style: {
                        fill: '#E5E5E5'
                    },
                    shape:{
                        cx:50,
                        cy:75,
                        r:80,
                        r0:60, 
                        startAngle:Math.PI,
                        endAngle:Math.PI*2,
                        clockwise:true
                    }
                },
                {
                    type: 'sector',
                    style: {
                        fill: 'green'
                    },
                    shape:{
                        cx:50,
                        cy:75,
                        r:80,
                        r0:60, 
                        startAngle:Math.PI,
                        endAngle:7*Math.PI/6, //https://i.ytimg.com/vi/OaLuFdRKbAI/maxresdefault.jpg
                        clockwise:true
                    }
                },
                {
                    type:"text",
                    y:20,
                    x:(progressLineLength*value/maxValue) / 2,
                    style:{
                        text:`${value}%`
                    }
                },
                {
                    type:"line",
                    shape:{
                        x1:70,
                        y1:0,
                        x2:70,
                        y2:70
                    },
                    style:{
                        lineDash:"dashed"
                    }
                },
                {
                    type:"text",
                    y:0,
                    x:71,
                    style:{
                        text:`2021`
                    }
                },
                {
                    type:"text",
                    y:40,
                    x:71,
                    style:{
                        text:`-15%`
                    }
                },

                ]
             }
            ]
    }
}
    return (
      <>
       {/* <span
          style={{
            borderLeft: "2px solid #000",
            height: 50,
            display: "inline-block",
            marginLeft: "25%", //Position p/r a la gauche
            position: "absolute",
          }}
        >
          {" "}
        </span>

        <div style={{ border: 1 }}>
          <div
            style={{
              height: 24,
              marginTop: 12,
              width: "25%", //completion
              backgroundColor: "#F00",
            }}
          ></div>
        </div>
        <br />
        <br />
        <br /> */}

            <EChartsReact option={options} />

      </>
    );
}