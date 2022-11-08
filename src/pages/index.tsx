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
} from "@mui/material";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import P3dEmbedApi from "../utils/external-p3d";
import TWEEN from "../utils/external-tween";
import { ChromePicker as MaterialPicker, Color, ColorResult, RGBColor } from "react-color";
import InputColor from "react-input-color";

export default function Home() {
  const navItems = ["Home", "About", "Contact"];
  const [colors, setColors] = useState<any>([]);
  const [panelExpanded, setPanelExpanded] = useState<any>(0);
  const [materialsList, setMaterialsList] = useState<any>([]);
  const [variants, setVariants] = useState<any>([]);
  let p3d: any = useRef(null);
  let materials: any = useRef(null);

  const getModelInfo = async () => {
    console.log("getModelInfo");
    const materialsFromModel = await p3d.current?.listMaterials();
    const variantsFromModel = await p3d.current?.listVariants();
    const objectsFromModel = await p3d.current?.listObjects();

    console.log(materialsFromModel);
    console.log(variantsFromModel);
    console.log(objectsFromModel);

    if (materialsFromModel.length > 0) {
      materials.current = materialsFromModel;
      setMaterialsList(() => materials.current);
      setColors(() => materials.current.map((material) => ({ hex: material.baseColor })));
    }
    if (variantsFromModel.length > 0) {
      setVariants(variantsFromModel);
    }
  };

  useEffect(() => {
    p3d.current = new P3dEmbedApi(document.getElementById("p3d-embed"), { onload: getModelInfo });
    console.log("p3d", p3d);

    p3d.current?.setAllowCameraReset("if-outside");

    p3d.current?.setAllowCameraRecenter(false);
  }, [p3d]);

  const handleChangeColor = (color, colorIndex: number) => {
    if (materials.current) {
      setColors((oldColors) =>
        oldColors.map((oldColor, oldIndex) => {
          if (oldIndex === colorIndex) {
            oldColor = color;
          }
          return oldColor;
        })
      );
      materials.current[colorIndex].baseColor = color.hex.replace("#", "");
    } else return;
  };

  const handleChangeMaterialValue = (materialValue: number, materialName: string, materialIndex: number) => {
    setMaterialsList((oldMaterials) =>
      oldMaterials.map((material, index) => {
        if (index === materialIndex) {
          material[materialName] = materialValue / 1000;
        }
        return material;
      })
    );
    materials.current[materialIndex][materialName] = materialValue / 1000;
  };

  const handleChangeMetalness = (checked: boolea, materialIndex: number) => {
    setMaterialsList((oldMaterials) =>
      oldMaterials.map((material, index) => {
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
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {navItems.map((item) => (
                <Button key={item} sx={{ color: "#fff" }}>
                  {item}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </AppBar>
        <Box marginTop="8vh">
          {variants.length > 0 && (
            <Box marginBottom={1}>
              <Button sx={{ mr: 1 }} variant="contained">
                Base
              </Button>
              {variants.map((variant) => (
                <Button variant="contained" key={variant.name}>
                  {variant.name}
                </Button>
              ))}
            </Box>
          )}
        </Box>
        <Grid spacing={2} container display="flex" direction="row">
          <Grid container item xs={12} md={8}>
            <Grid item xs={12} sx={{ maxHeight: "70vh", height: "70vh" }}>
              <iframe
                frameBorder="0"
                src="https://p3d.in/e/sUrr1+api+load+controls,variants,hotspots-hidden+spin"
                // src="https://p3d.in/e/xXis0+api+load+controls,variants,hotspots-hidden+spin"
                id="p3d-embed"
              ></iframe>
            </Grid>
          </Grid>
          <Box /* container spacing={2} item xs={12} md={4} */ /* direction="column" */ sx={{ width: "20vw" }}>
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
                          <Slider
                            valueLabelFormat={(label) => label / 1000}
                            valueLabelDisplay="auto"
                            max={1000}
                            onChange={(_, value) => handleChangeMaterialValue(Number(value), "glowFactor", index)}
                            value={material.glowFactor * 1000}
                          />
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