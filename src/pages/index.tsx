import { ExpandMore, Menu } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  Slider,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import P3dEmbedApi from "../utils/external-p3d";
import TWEEN from "../utils/external-tween";
import { ChromePicker as MaterialPicker, Color, ColorResult, RGBColor } from "react-color";
import InputColor from "react-input-color";

export default function Home() {
  const viewPort = useMediaQuery("(min-width:900px)");
  const [colors, setColors] = useState<any>([]);
  const [glowColor, setGlowColor] = useState<any>([]);
  const [panelExpanded, setPanelExpanded] = useState<any>(0);
  const [materialsList, setMaterialsList] = useState<any>([]);
  let p3d: any = useRef(null);
  let materials: any = useRef(null);

  const getModelInfo = async () => {
    console.log("getModelInfo");
    const materialsFromModel = await p3d.current?.listMaterials();
    const camera = await p3d.current?.getCamera();

    if (materialsFromModel.length > 0) {
      materials.current = materialsFromModel;
      setMaterialsList(() => materials.current);
      setColors(() => materials.current.map((material: any) => ({ hex: material.baseColor })));
      setGlowColor(() => materials.current.map((material: any) => ({ hex: material.glowColor })));
    }
  };

  useEffect(() => {
    p3d.current = new P3dEmbedApi(document.getElementById("p3d-embed"), {
      onload: getModelInfo,
    });

    p3d.current?.setAllowCameraReset("if-outside");

    p3d.current?.setAllowCameraRecenter(false);
  }, [p3d]);

  const handleChangeColor = (color: any, colorIndex: number) => {
    if (materials.current) {
      setColors((oldColors: any) =>
        oldColors.map((oldColor: any, oldIndex: any) => {
          if (oldIndex === colorIndex) {
            oldColor = color;
          }
          return oldColor;
        })
      );
      materials.current[colorIndex].baseColor = color.hex.replace("#", "");
    } else return;
  };

  const handleChangeGlow = (color: any, colorIndex: number) => {
    if (materials.current) {
      setGlowColor((oldColors: any) =>
        oldColors.map((oldColor: any, oldIndex: any) => {
          if (oldIndex === colorIndex) {
            oldColor = color;
          }
          return oldColor;
        })
      );
      materials.current[colorIndex].glowColor = color.hex.replace("#", "");
    } else return;
  };

  const handleChangeMaterialValue = (materialValue: number, materialName: string, materialIndex: number) => {
    setMaterialsList((oldMaterials: any) =>
      oldMaterials.map((material: any, index: any) => {
        if (index === materialIndex) {
          material[materialName] = materialValue / 1000;
        }
        return material;
      })
    );
    materials.current[materialIndex][materialName] = materialValue / 1000;
  };

  const handleChangeMetalness = (checked: boolean, materialIndex: number) => {
    setMaterialsList((oldMaterials: any) =>
      oldMaterials.map((material: any, index: any) => {
        if (index === materialIndex) {
          material.metalness = checked ? 1 : 0;
        }
        return material;
      })
    );
    materials.current[materialIndex].metalness = checked ? 1 : 0;
  };

  const onChangePanelOpen = (panelIndex: number) => {
    setPanelExpanded(panelIndex === panelExpanded ? -1 : panelIndex);
  };

  return (
    <>
      <Container>
        <AppBar component="nav">
          <Toolbar>
            <IconButton color="inherit" aria-label="open drawer" edge="start" sx={{ mr: 2, display: { sm: "none" } }}>
              <Menu />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}>
              3D Prototype
            </Typography>
          </Toolbar>
        </AppBar>
        <Grid marginTop="8vh" spacing={2} container display="flex" direction="row">
          <Grid container item xs={12} md={7}>
            <Grid item xs={12} sx={{ maxHeight: "70vh", height: "70vh" }}>
              <iframe
                frameBorder="0"
                src="https://p3d.in/e/xXis0+api+spin+load+shading,dl,share,spin,link,variants-hidden"
                id="p3d-embed"
              ></iframe>
            </Grid>
          </Grid>
          <Box sx={{ width: viewPort ? "25vw" : "100%", height: viewPort ? "75vh" : "100%", overflow: "auto" }}>
            {materialsList.length > 0 ? (
              materialsList?.map((material: any, index: number) => (
                <Box margin={1} key={`${material.name}_${index + 1}`}>
                  <Accordion expanded={panelExpanded === index} onChange={() => onChangePanelOpen(index)}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>{`${index + 1}: ${material.name}`}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Box>
                          <Tooltip title="Cor base do material">
                            <Typography sx={{ mb: 1 }} variant="body2">
                              Base color
                            </Typography>
                          </Tooltip>
                          <MaterialPicker
                            color={colors[index]}
                            onChange={(color) => handleChangeColor(color, index)}
                            disableAlpha
                          />
                          <Box sx={{ mt: 2 }}>
                            <Tooltip title="Fator da cor base">
                              <Typography variant="body2">Base color factor</Typography>
                            </Tooltip>
                            <Slider
                              valueLabelFormat={(label) => label / 1000}
                              valueLabelDisplay="auto"
                              max={1000}
                              onChange={(_, value) =>
                                handleChangeMaterialValue(Number(value), "baseColorFactor", index)
                              }
                              value={material.baseColorFactor * 1000}
                            />
                          </Box>
                        </Box>
                        <Box marginTop={1} marginBottom={2} display="flex" flexDirection="row" alignItems="center">
                          <Tooltip title="Acabamento metálico do material">
                            <Typography
                              sx={{ cursor: "pointer" }}
                              onClick={() => handleChangeMetalness(!material.metalness, index)}
                              variant="body2"
                            >
                              Metalness
                            </Typography>
                          </Tooltip>
                          <Checkbox
                            sx={{ py: 0 }}
                            checked={material.metalness}
                            onChange={(_, checked) => handleChangeMetalness(checked, index)}
                          />
                          {/* <Slider
                            valueLabelFormat={(label) => label / 1000}
                            valueLabelDisplay="auto"
                            max={1000}
                            onChange={(_, value) => handleChangeMaterialValue(Number(value), "metalness", index)}
                            value={material.metalness * 1000}
                          /> */}
                        </Box>
                        <Box>
                          <Tooltip title="Aspereza do material">
                            <Typography variant="body2">Roughness</Typography>
                          </Tooltip>
                          <Slider
                            valueLabelFormat={(label) => label / 1000}
                            valueLabelDisplay="auto"
                            max={1000}
                            onChange={(_, value) => handleChangeMaterialValue(Number(value), "roughness", index)}
                            value={material.roughness * 1000}
                          />
                        </Box>
                        <Box>
                          <Tooltip title="Reflexo especular em volta do material">
                            <Typography variant="body2">Sheen</Typography>
                          </Tooltip>
                          <Slider
                            valueLabelFormat={(label) => label / 1000}
                            valueLabelDisplay="auto"
                            max={1000}
                            onChange={(_, value) => handleChangeMaterialValue(Number(value), "sheenFactor", index)}
                            value={material.sheenFactor * 1000}
                          />
                        </Box>
                        <Box>
                          <Tooltip title="Camada de acabamento (ex: verniz)">
                            <Typography variant="body2">Clearcoat</Typography>
                          </Tooltip>
                          <Slider
                            valueLabelFormat={(label) => label / 1000}
                            valueLabelDisplay="auto"
                            max={1000}
                            onChange={(_, value) => handleChangeMaterialValue(Number(value), "clearCoat", index)}
                            value={material.clearCoat * 1000}
                          />
                        </Box>
                        <Box>
                          <Tooltip title="Aspereza da camada de acabamento">
                            <Typography variant="body2">Clearcoat Roughness</Typography>
                          </Tooltip>
                          <Slider
                            valueLabelFormat={(label) => label / 1000}
                            valueLabelDisplay="auto"
                            max={1000}
                            onChange={(_, value) =>
                              handleChangeMaterialValue(Number(value), "clearCoatRoughness", index)
                            }
                            value={material.clearCoatRoughness * 1000}
                          />
                        </Box>
                        <Box>
                          <Tooltip title="Capacidade de luminosa do material">
                            <Typography variant="body2">Emissivo</Typography>
                          </Tooltip>
                          <MaterialPicker
                            color={glowColor[index]}
                            onChange={(color) => handleChangeGlow(color, index)}
                            disableAlpha
                          />
                          <Box sx={{ mt: 2 }}>
                            <Tooltip title="Fator da emissividade do material">
                              <Typography variant="body2">Fator emissivo</Typography>
                            </Tooltip>
                            <Slider
                              valueLabelFormat={(label) => label / 1000}
                              valueLabelDisplay="auto"
                              max={1000}
                              onChange={(_, value) => handleChangeMaterialValue(Number(value), "glowFactor", index)}
                              value={material.glowFactor * 1000}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              ))
            ) : (
              <></>
            )}
          </Box>
        </Grid>
      </Container>
      {/* <Script src="https://cfstatic.p3d.in/embed-api/v2/p3d-embed-api.js" />
      <Script src="https://unpkg.com/@tweenjs/tween.js@18.6.4/dist/tween.umd.js" /> */}
    </>
  );
}
